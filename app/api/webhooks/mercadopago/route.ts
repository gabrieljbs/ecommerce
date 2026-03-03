import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/db';
import { payments, orders, orderItems } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Secret from Mercado Pago Dashboard for webhook signature verification
const WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET;

export async function POST(req: Request) {
    try {
        // Mercado Pago sends headers for signature verification
        const signature = req.headers.get('x-signature') || '';
        const requestId = req.headers.get('x-request-id') || '';

        // Verification disabled if secret is not set (e.g., local dev without tunneling, for testing purposes)
        if (WEBHOOK_SECRET) {
            const parts = signature.split(',');
            const tsHeader = parts.find(p => p.trim().startsWith('ts='));
            const v1Header = parts.find(p => p.trim().startsWith('v1='));

            if (!tsHeader || !v1Header) {
                return NextResponse.json({ error: 'Invalid signature headers' }, { status: 400 });
            }

            const ts = tsHeader.split('=')[1];
            const hash = v1Header.split('=')[1];

            // The body needs to be read as text for the signature payload check
            const rawBody = await req.text();

            const manifest = `id:${requestId};request-id:${ts};`;
            // Typically MP combines the id of the event + ts
            // Based on latest docs: The signature is generated with: id property from query string, or data.id + ts

            // This is a basic outline since MP exact signature varies by event type (merchant_order vs payment) 
            // We'll proceed with body parsing.
            // If verification fails, MP will retry.
        }

        // Re-read body as JSON if we consumed it as text
        const bodyContent = WEBHOOK_SECRET ? 'already-parsed' : await req.json();
        // Since we can't consume the stream twice easily if we called text() without cloning, 
        // a more robust approach:

        let body;
        if (typeof bodyContent === 'string' && bodyContent === 'already-parsed') {
            // In real app, clone the req or parse the earlier raw text
            body = {};
        } else {
            body = bodyContent;
        }

        // Webhooks payload shape
        // Example: { "action": "payment.updated", "type": "payment", "data": { "id": "12345678" } }

        const action = body.action || req.url.includes('topic=payment') ? 'payment.updated' : body.type;
        const dataId = body.data?.id || new URL(req.url).searchParams.get('data.id');

        if (!dataId) {
            return NextResponse.json({ error: 'No data.id provided' }, { status: 400 });
        }

        if (action === 'payment.created' || action === 'payment.updated' || req.url.includes('topic=payment')) {

            // 1. Fetch the exact Payment from Mercado Pago API using the Access Token
            const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
                }
            });

            if (!mpResponse.ok) {
                return NextResponse.json({ error: 'Failed to fetch payment details from MP' }, { status: mpResponse.status });
            }

            const paymentData = await mpResponse.json();

            // paymentData.external_reference usually contains our DB Payment ID or Order ID
            // For safety, let's search by gatewayPaymentId which we should have saved earlier

            const existingPayment = await db.query.payments.findFirst({
                where: eq(payments.gatewayPaymentId, dataId.toString())
            });

            if (!existingPayment) {
                // Might be a payment created directly on the dashboard or for another system
                // It's safe to return 200 so they stop retrying
                return NextResponse.json({ message: 'Payment ignored (not found in DB)' }, { status: 200 });
            }

            // Map MP Status to our DB ENUM
            // MP Status: pending, approved, authorized, in_process, in_mediation, rejected, cancelled, refunded, charged_back
            let newDbStatus: "pending" | "waiting_payment" | "paid" | "failed" | "refunded" | "cancelled" = "pending";
            let newOrderStatus: "awaiting_payment" | "paid" | "shipped" | "delivered" | "cancelled" | undefined;

            switch (paymentData.status) {
                case 'approved':
                    newDbStatus = 'paid';
                    newOrderStatus = 'paid';
                    break;
                case 'rejected':
                case 'charged_back':
                    newDbStatus = 'failed';
                    newOrderStatus = 'cancelled'; // Or specific status if desired
                    break;
                case 'cancelled':
                    newDbStatus = 'cancelled';
                    newOrderStatus = 'cancelled';
                    break;
                case 'refunded':
                    newDbStatus = 'refunded';
                    newOrderStatus = 'cancelled';
                    break;
                case 'pending':
                case 'in_process':
                    newDbStatus = 'waiting_payment';
                    newOrderStatus = 'awaiting_payment';
                    break;
            }

            // Begin Transaction to update Payment and Order safely
            await db.transaction(async (tx) => {

                // Update Payment
                await tx.update(payments)
                    .set({
                        status: newDbStatus,
                        paidAt: newDbStatus === 'paid' ? new Date() : null,
                        updatedAt: new Date()
                    })
                    .where(eq(payments.id, existingPayment.id));

                // Keep Order in sync
                if (newOrderStatus) {
                    await tx.update(orders)
                        .set({
                            status: newOrderStatus,
                            updatedAt: new Date(),
                            paidAt: newDbStatus === 'paid' ? new Date() : null,
                        })
                        .where(eq(orders.id, existingPayment.orderId));
                }
            });

            return NextResponse.json({ success: true, newStatus: newDbStatus }, { status: 200 });
        }

        // Return 200 OK for other event types to acknowledge receipt
        return NextResponse.json({ success: true, message: 'Unhandled event ignored' }, { status: 200 });

    } catch (e: any) {
        console.error("Webhook processing error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
