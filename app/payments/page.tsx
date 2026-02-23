export const runtime = "nodejs";

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getOrderForPayment } from "@/action/payment";
import PixPayment from "@/components/Payment/PixPayment";
import {
    ArrowLeft,
    ShoppingBag,
    CreditCard,
    CheckCircle2,
} from "lucide-react";

function fmt(cents: number) {
    return (cents / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

export default async function PaymentsPage({
    searchParams,
}: {
    searchParams: Promise<{ orderId?: string }>;
}) {
    const user = await auth();
    if (!user) redirect("/login?redirect=/payments");

    const { orderId } = await searchParams;
    if (!orderId) redirect("/orders");

    const order = await getOrderForPayment(orderId);
    if (!order) notFound();

    // Se já pago (ou cancelado), redireciona pro detalhe do pedido
    if (order.status === "paid" || order.status === "cancelled") {
        redirect(`/orders/${orderId}`);
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
            <div className="container mx-auto px-4 py-10 max-w-2xl">

                {/* Back */}
                <Link
                    href={`/orders/${orderId}`}
                    className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft size={15} /> Voltar ao pedido
                </Link>

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-zinc-900 dark:bg-white rounded-2xl shadow-lg">
                        <CreditCard size={22} className="text-white dark:text-zinc-900" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
                            Pagamento
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Pedido #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                    </div>
                </div>

                <div className="grid gap-5">
                    {/* Card — Resumo do Pedido */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 mb-4">
                            <ShoppingBag size={14} />
                            Resumo do Pedido
                        </h2>

                        <div className="space-y-2 mb-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-600 dark:text-zinc-400">
                                        {item.quantity}× {item.productTitle}
                                    </span>
                                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                        {fmt(item.totalPrice)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-1.5">
                            <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
                                <span>Subtotal</span>
                                <span>{fmt(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
                                <span>Frete {order.shippingMethod ? `(${order.shippingMethod})` : ""}</span>
                                <span>{fmt(order.shippingPrice)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600">
                                    <span>Desconto</span>
                                    <span>- {fmt(order.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <span className="font-bold text-zinc-900 dark:text-white">Total</span>
                                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                    {fmt(order.total)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card — Pagamento PIX */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                        <PixPayment
                            orderId={order.id}
                            total={order.total}
                            orderStatus={order.status}
                            payerEmail={order.customerEmail ?? user.email}
                        />
                    </div>

                    {/* Info segurança */}
                    <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
                        <CheckCircle2 size={13} className="text-emerald-500" />
                        Ambiente seguro · Criptografia SSL · Processado pelo Mercado Pago
                    </div>
                </div>
            </div>
        </main>
    );
}