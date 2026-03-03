"use server";

import { db } from "@/db";
import { eq, desc } from "drizzle-orm";
import { orders, payments } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function processPayment(orderId: string, formData: Record<string, unknown>) {
    const order = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
        with: { items: true },
    });

    if (!order) throw new Error("Pedido não encontrado");

    // Prevenção de duplicidade: usar PIX pendente se já existir um
    const existingPayment = await db.query.payments.findFirst({
        where: eq(payments.orderId, orderId),
        orderBy: [desc(payments.createdAt)],
    });

    if (existingPayment && existingPayment.status === "waiting_payment" && existingPayment.pixQrCode) {
        console.log("[PagSeguro Request] Reaproveitando PIX pendente existente no banco.");
        return {
            status: existingPayment.status,
            qrCode: existingPayment.pixQrCode,
            gatewayId: existingPayment.gatewayPaymentId,
        };
    }

    const token = process.env.PAGSEGURO_TOKEN;
    const baseUrl = process.env.PAGSEGURO_BASE_URL;

    if (!token) throw new Error("PAGSEGURO_TOKEN não configurado.");

    // No PagSeguro nós mesmos vamos criar o objeto 'payer' por via de form HTML no frontend
    const payer = (formData.payer as Record<string, any>) ?? {};
    const method = formData.payment_method_id as string;
    const cleanCpf = (payer.cpf || "11111111111").replace(/\D/g, "");

    const body: Record<string, any> = {
        reference_id: `order-${order.id}`,
        customer: {
            name: payer.name || "Cliente Teste",
            email: payer.email || process.env.PAGSEGURO_EMAIL || "teste@sandbox.pagseguro.com.br",
            tax_id: cleanCpf,
            phones: [{ country: "55", area: "11", number: "999999999", type: "MOBILE" }]
        },
        items: order.items.map(item => ({
            reference_id: `item-${item.id}`,
            name: item.productTitle,
            quantity: item.quantity,
            unit_amount: item.unitPrice,
        })),
        notification_urls: process.env.NEXT_PUBLIC_APP_URL
            ? [`${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/pagseguro`]
            : [],
    };

    if (method === "pix") {
        body.qr_codes = [{
            amount: { value: order.total },
            expiration_date: new Date(Date.now() + 3600000).toISOString() // 1 hora
        }];
    }

    console.log("[PagSeguro Request] ", JSON.stringify(body, null, 2));

    const cleanUrl = baseUrl?.endsWith('/') ? baseUrl?.slice(0, -1) : baseUrl;

    const response = await fetch(`${cleanUrl}/orders`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "x-idempotency-key": `pay-${orderId}-${Date.now()}`
        },
        body: JSON.stringify(body),
    });

    const textResponse = await response.text();
    let data;

    try {
        data = JSON.parse(textResponse);
    } catch (e) {
        console.error("[PagSeguro API Text Error]", textResponse);
        throw new Error(`Falha de comunicação: recebi "${textResponse.substring(0, 30)}..." do PagSeguro.`);
    }

    if (!response.ok) {
        console.error("[PagSeguro API Error Raw]", JSON.stringify(data, null, 2));
        const errorMessage = data.error_messages ? data.error_messages[0].description : "Erro na cobrança PagSeguro";
        throw new Error(`Erro PagSeguro: ${errorMessage}`);
    }

    let qrCode = null;
    let qrCodeBase64 = null;
    if (method === "pix" && data.qr_codes && data.qr_codes.length > 0) {
        qrCode = data.qr_codes[0].text;
    }

    const newStatus = "waiting_payment";

    await db.insert(payments).values({
        orderId: order.id,
        amount: order.total,
        method: method === "pix" ? "pix" : "credit_card",
        status: newStatus,
        gateway: "pagseguro",
        gatewayPaymentId: data.id,
        pixQrCode: qrCode,
        pixQrCodeBase64: null,
    }).onConflictDoNothing({ target: payments.gatewayPaymentId });

    return {
        status: newStatus,
        qrCode,
        gatewayId: data.id,
    };
}

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

export async function mockPaySandboxPix(orderId: string) {
    if (process.env.NODE_ENV !== "development") throw new Error("Not allowed outside DEV environment.");

    await db.update(orders)
        .set({ status: "paid" })
        .where(eq(orders.id, orderId));

    await db.update(payments)
        .set({ status: "paid" })
        .where(eq(payments.orderId, orderId));

    return { success: true };
}
