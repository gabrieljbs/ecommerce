import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import { eq } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Valida a assinatura do Mercado Pago (HMAC-SHA256)
// Documentação: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
//
// O MP envia no header:
//   x-signature: ts=<timestamp>,v1=<hash>
//   x-request-id: <uuid>
//
// A string assinada é: "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
// ---------------------------------------------------------------------------
function validateSignature(req: NextRequest, rawBody: string): boolean {
    const secret = process.env.MP_WEBHOOK_SECRET;
    if (!secret) {
        console.warn("[MP Webhook] MP_WEBHOOK_SECRET não definido — pulando validação");
        return true; // em dev sem secret configurado, deixa passar
    }

    const xSignature = req.headers.get("x-signature") ?? "";
    const xRequestId = req.headers.get("x-request-id") ?? "";

    // Extrai ts e v1 do header x-signature
    // Formato: "ts=1704147461,v1=abc123..."
    const parts = Object.fromEntries(
        xSignature.split(",").map((part) => part.split("=") as [string, string])
    );
    const ts = parts["ts"];
    const v1 = parts["v1"];

    if (!ts || !v1) {
        console.error("[MP Webhook] Header x-signature inválido:", xSignature);
        return false;
    }

    // Extrai o data.id do corpo para montar a string assinada
    let dataId = "";
    try {
        const parsed = JSON.parse(rawBody);
        dataId = String(parsed?.data?.id ?? "");
    } catch {
        console.error("[MP Webhook] Corpo JSON inválido");
        return false;
    }

    // String que o MP assina: "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
    const toSign = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    const expectedHmac = createHmac("sha256", secret)
        .update(toSign)
        .digest("hex");

    try {
        const expected = Buffer.from(expectedHmac, "hex");
        const received = Buffer.from(v1, "hex");

        if (expected.length !== received.length) return false;

        return timingSafeEqual(expected, received);
    } catch {
        return false;
    }
}

// ---------------------------------------------------------------------------
// POST /api/webhooks/mercado-pago
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
    // Lê o body como texto para validar a assinatura antes de parsear
    const rawBody = await req.text();

    // Valida assinatura
    if (!validateSignature(req, rawBody)) {
        console.error("[MP Webhook] ❌ Assinatura inválida — requisição rejeitada");
        return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
        body = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    console.log("[MP Webhook] Notificação recebida:", body.type, body.action);

    try {
        // O MP envia diferentes tipos de notificação — só nos interessa "payment"
        if (body.type !== "payment") {
            return NextResponse.json({ received: true });
        }

        const mpPaymentId = String((body.data as Record<string, unknown>)?.id ?? "");
        if (!mpPaymentId || mpPaymentId === "undefined") {
            return NextResponse.json({ error: "ID inválido" }, { status: 400 });
        }

        // Consulta o status real do pagamento na API do MP
        const mpRes = await fetch(
            `https://api.mercadopago.com/v1/payments/${mpPaymentId}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                },
            }
        );

        if (!mpRes.ok) {
            console.error("[MP Webhook] Erro ao consultar pagamento:", await mpRes.text());
            return NextResponse.json({ error: "Erro ao consultar MP" }, { status: 500 });
        }

        const mpPayment = await mpRes.json();
        const mpStatus: string = mpPayment.status; // "approved", "pending", "rejected"...
        const externalReference: string = mpPayment.external_reference ?? "";

        console.log(`[MP Webhook] Payment ${mpPaymentId} → status: ${mpStatus}, ref: ${externalReference}`);

        // Busca o payment interno pelo gatewayPaymentId
        const paymentRecord = await db.query.payments.findFirst({
            where: eq(payments.gatewayPaymentId, mpPaymentId),
        });

        if (!paymentRecord) {
            // Pode chegar antes de gravar — retorna 200 para o MP não retentar
            console.warn(`[MP Webhook] Payment ${mpPaymentId} não encontrado no banco ainda`);
            return NextResponse.json({ received: true });
        }

        // Mapeia status MP → status interno
        const statusMap: Record<string, "awaiting_payment" | "paid" | "failed" | "refunded" | "cancelled"> = {
            pending: "awaiting_payment",
            approved: "paid",
            authorized: "awaiting_payment",
            in_process: "awaiting_payment",
            in_mediation: "awaiting_payment",
            rejected: "failed",
            cancelled: "cancelled",
            refunded: "refunded",
            charged_back: "refunded",
        };

        const newPaymentStatus = statusMap[mpStatus] ?? "awaiting_payment";

        // Atualiza o payment interno
        await db.update(payments)
            .set({ status: newPaymentStatus, updatedAt: new Date() })
            .where(eq(payments.id, paymentRecord.id));

        // Se aprovado → atualiza o pedido para "paid"
        if (newPaymentStatus === "paid") {
            await db.update(orders)
                .set({ status: "paid" })
                .where(eq(orders.id, paymentRecord.orderId));

            console.log(`[MP Webhook] ✅ Pedido ${paymentRecord.orderId} marcado como PAGO`);
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        console.error("[MP Webhook] Erro interno:", err);
        // Sempre retorna 200 para o MP não ficar retentando indefinidamente
        return NextResponse.json({ received: true });
    }
}
