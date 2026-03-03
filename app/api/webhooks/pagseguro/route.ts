import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { orders, payments } from "@/db/schema";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Extrai o ID da Order que o PagSeguro manda no Webhook
        const pagSeguroOrderId = body.id;
        const charges = body.charges;

        if (!pagSeguroOrderId) {
            return NextResponse.json({ error: "Missing order id" }, { status: 400 });
        }

        console.log("[PagSeguro Webhook] Recebido Order:", pagSeguroOrderId);

        // Verifica se alguma das cobranças atreladas ao pedido está "PAID"
        const isPaid = charges?.some((charge: any) => charge.status === "PAID");

        // Busca qual é o nosso Pedido atrelado a esse ID externo
        const paymentRecord = await db.query.payments.findFirst({
            where: eq(payments.gatewayPaymentId, pagSeguroOrderId)
        });

        if (!paymentRecord) {
            console.error("[PagSeguro Webhook] Pedido não encontrado no banco:", pagSeguroOrderId);
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (isPaid && paymentRecord.status !== "paid") {
            // Marca o Pagamento como pago
            await db.update(payments)
                .set({ status: "paid", paidAt: new Date() })
                .where(eq(payments.id, paymentRecord.id));

            // Marca o Pedido como pago
            await db.update(orders)
                .set({ status: "paid" })
                .where(eq(orders.id, paymentRecord.orderId));

            console.log(`[PagSeguro Webhook] Pedido ${paymentRecord.orderId} marcado como PAGO com sucesso.`);
        }

        /**
         * Retornamos status 200 pro PagSeguro parar de enviar a mesma notificação
         */
        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error: any) {
        console.error("[PagSeguro Webhook Error]", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
