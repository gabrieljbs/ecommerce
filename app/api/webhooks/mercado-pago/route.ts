import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // O Mercado Pago envia diferentes tipos de notificação
        // Só nos interessa o tipo "payment"
        if (body.type !== "payment") {
            return NextResponse.json({ received: true });
        }

        const mpPaymentId = String(body.data?.id);
        if (!mpPaymentId) {
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
            console.error("Erro ao consultar MP:", await mpRes.text());
            return NextResponse.json({ error: "Erro ao consultar MP" }, { status: 500 });
        }

        const mpPayment = await mpRes.json();
        const mpStatus: string = mpPayment.status; // "approved", "pending", "rejected"...

        // Busca o payment interno pelo gatewayPaymentId
        const paymentRecord = await db.query.payments.findFirst({
            where: eq(payments.gatewayPaymentId, mpPaymentId),
        });

        if (!paymentRecord) {
            // Pode chegar antes de gravar — retorna 200 para o MP não retentar
            console.warn(`Payment ${mpPaymentId} não encontrado no banco`);
            return NextResponse.json({ received: true });
        }

        // Mapeia o status do MP para o status interno
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

            console.log(`✅ Pedido ${paymentRecord.orderId} marcado como PAGO`);
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        console.error("Webhook error:", err);
        // Sempre retorna 200 para o MP não ficar retentando
        return NextResponse.json({ received: true });
    }
}
