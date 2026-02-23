"use server";

import { db } from "@/db";
import { eq, desc } from "drizzle-orm";
import { orders, payments } from "@/db/schema";
import { auth } from "@/lib/auth";
import { MercadoPagoConfig, Payment as MPPayment } from "mercadopago";

/**
 * Processa qualquer método de pagamento do Payment Brick:
 * PIX (bank_transfer), cartão de crédito e débito.
 */
export async function processPayment(orderId: string, formData: Record<string, unknown>) {
    const order = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
    });

    if (!order) throw new Error("Pedido não encontrado");

    // Em testes, o MP exige um @testuser.com como pagador.
    const formPayer = (formData.payer as Record<string, unknown>) ?? {};
    const isTest = !!process.env.MP_TEST_PAYER_EMAIL;
    const payerEmail = isTest
        ? process.env.MP_TEST_PAYER_EMAIL!
        : (formPayer.email as string | undefined) ?? "";

    console.log("[processPayment] method:", formData.payment_method_id);
    console.log("[processPayment] email:", payerEmail);
    console.log("[processPayment] isTest:", isTest);
    console.log("[processPayment] token:", process.env.MP_ACCESS_TOKEN ?? "⚠️ UNDEFINED");

    const client = new MercadoPagoConfig({
        accessToken: process.env.MP_ACCESS_TOKEN!,
        options: { idempotencyKey: `pay-${orderId}-${Date.now()}` },
    });

    const mpPayment = new MPPayment(client);

    // Monta o body baseado no método de pagamento
    const isPix = formData.payment_method_id === "pix";

    // identification é obrigatório para PIX e recomendado para todos os métodos no Brasil.
    // Em testes, use CPF fictício válido. Em produção, virá do formulário.
    const identification = (formPayer.identification as Record<string, unknown>) ?? {
        type: "CPF",
        number: process.env.MP_TEST_PAYER_CPF ?? "12345678909", // CPF de teste padrão do MP
    };

    const paymentBody: Record<string, unknown> = {
        transaction_amount: order.total / 100, // centavos → reais
        description: `Pedido #${orderId}`, // campo obrigatório pela API do Mercado Pago
        payment_method_id: formData.payment_method_id,
        payer: {
            ...formPayer,         // dados vindos do Payment Brick (nome, etc.)
            email: payerEmail,    // sobrescreve com o email correto (teste ou real)
            identification,       // CPF/CNPJ obrigatório para PIX e BR
        },
        external_reference: orderId,
        ...(process.env.NEXT_PUBLIC_APP_URL ? {
            notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercado-pago`,
        } : {}),
    };

    // Campos extras para cartão
    if (!isPix) {
        paymentBody.token = formData.token;
        paymentBody.installments = formData.installments ?? 1;
        paymentBody.issuer_id = formData.issuer_id;
    }

    console.log("[processPayment] body:", JSON.stringify(paymentBody, null, 2));

    let data;
    try {
        data = await mpPayment.create({ body: paymentBody });
    } catch (err: unknown) {
        console.error("[MP SDK Error]", JSON.stringify(err, null, 2));
        const msg = (err as { message?: string })?.message ?? JSON.stringify(err);
        throw new Error(`Mercado Pago: ${msg}`);
    }

    console.log("[MP Payment] id:", data.id, "status:", data.status);

    // QR Code (apenas PIX)
    const qrCode: string | null =
        data.point_of_interaction?.transaction_data?.qr_code ?? null;
    const qrCodeBase64: string | null =
        data.point_of_interaction?.transaction_data?.qr_code_base64 ?? null;

    // Salva o registro no banco
    await db.insert(payments).values({
        orderId: order.id,
        amount: order.total,
        method: isPix ? "pix" : "credit_card",
        status: data.status === "approved" ? "paid" : "awaiting_payment",
        gateway: "mercado_pago",
        gatewayPaymentId: String(data.id),
        pixQrCode: qrCode,
        pixQrCodeBase64: qrCodeBase64,
    }).onConflictDoNothing();

    // Se cartão aprovado na hora, atualiza o pedido
    if (data.status === "approved") {
        await db.update(orders)
            .set({ status: "paid" })
            .where(eq(orders.id, orderId));
    }

    return {
        status: data.status,
        qrCode,
        qrCodeBase64,
        mpPaymentId: String(data.id),
    };
}

/** Busca o status do último pagamento de um pedido (polling) */
export async function checkPaymentStatus(orderId: string) {
    const user = await auth();
    if (!user) throw new Error("Não autorizado");

    const order = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
    });

    if (!order || order.userId !== user.id) throw new Error("Pedido não encontrado");

    const paymentRecord = await db.query.payments.findFirst({
        where: eq(payments.orderId, orderId),
        orderBy: (p) => [desc(p.createdAt)],
    });

    return {
        orderStatus: order.status,
        paymentStatus: paymentRecord?.status ?? null,
        paid: order.status === "paid",
    };
}

/** Busca o pedido para exibir na página de pagamento (verificando o dono) */
export async function getOrderForPayment(orderId: string) {
    const user = await auth();
    if (!user) return null;

    const order = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
        with: { items: true },
    });

    if (!order || order.userId !== user.id) return null;
    return order;
}
