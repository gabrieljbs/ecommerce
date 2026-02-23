export const runtime = "nodejs";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    MapPin,
    User,
    ShoppingBag,
    Truck,
    CreditCard,
    CheckCircle2,
    XCircle,
    Clock,
    Package,
    CalendarDays,
    QrCode,
} from "lucide-react";

// ── Status timeline ─────────────────────────────────────────────────────────
const STATUS_STEPS = [
    { key: "awaiting_payment", label: "Aguardando Pagamento", icon: CreditCard },
    { key: "paid", label: "Pagamento Confirmado", icon: CheckCircle2 },
    { key: "shipped", label: "Enviado", icon: Truck },
    { key: "delivered", label: "Entregue", icon: Package },
] as const;

const STATUS_ORDER = ["awaiting_payment", "paid", "shipped", "delivered"];

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    awaiting_payment: { label: "Aguardando Pagamento", bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
    paid: { label: "Pago", bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    shipped: { label: "Enviado", bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
    delivered: { label: "Entregue", bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    cancelled: { label: "Cancelado", bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
};

function fmt(cents: number) {
    return Number(cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(date: Date) {
    return new Date(date).toLocaleString("pt-BR", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

export default async function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const user = await auth();
    if (!user) redirect(`/login?callbackUrl=/orders/${id}`);

    const order = await db.query.orders.findFirst({
        where: and(eq(orders.id, id), eq(orders.userId, user.id)),
        with: { items: true },
    });

    if (!order) notFound();

    const badge = STATUS_BADGE[order.status] ?? STATUS_BADGE.awaiting_payment;
    const currentStatusIdx = STATUS_ORDER.indexOf(order.status);
    const isCancelled = order.status === "cancelled";

    return (
        <main className="container mx-auto px-4 py-10 max-w-3xl">
            {/* Back + Header */}
            <Link
                href="/orders"
                className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6"
            >
                <ArrowLeft size={15} /> Meus Pedidos
            </Link>

            <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        Pedido #{order.id.slice(0, 8).toUpperCase()}
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-1">
                        <CalendarDays size={13} /> {fmtDate(order.createdAt)}
                    </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    {badge.label}
                </span>
            </div>

            {/* ── Pagamento pendente: banner CTA ── */}
            {order.status === "awaiting_payment" && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 mb-5 flex flex-col sm:flex-row items-center gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                        <QrCode size={22} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <p className="font-bold text-amber-800 dark:text-amber-300">
                            Seu pedido aguarda pagamento
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                            Pague com PIX e tenha confirmação imediata.
                        </p>
                    </div>
                    <Link
                        href={`/payments?orderId=${order.id}`}
                        className="shrink-0 flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-amber-200 dark:shadow-none whitespace-nowrap"
                    >
                        <QrCode size={16} />
                        Pagar Agora
                    </Link>
                </div>
            )}

            {/* ── Status Timeline ── */}
            {!isCancelled && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mb-5">
                    <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-5">
                        Acompanhamento
                    </h2>
                    <div className="flex items-start gap-0">
                        {STATUS_STEPS.map(({ key, label, icon: Icon }, i) => {
                            const done = STATUS_ORDER.indexOf(key) <= currentStatusIdx;
                            const active = key === order.status;
                            const isLast = i === STATUS_STEPS.length - 1;
                            return (
                                <div key={key} className="flex-1 flex flex-col items-center">
                                    {/* connector + circle row */}
                                    <div className="flex items-center w-full">
                                        {/* left line */}
                                        <div className={`flex-1 h-0.5 ${i === 0 ? "opacity-0" : done ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"}`} />
                                        {/* circle */}
                                        <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all
                                            ${done
                                                ? "bg-emerald-500 border-emerald-500"
                                                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"}`}>
                                            <Icon size={15} className={done ? "text-white" : "text-zinc-400"} />
                                        </div>
                                        {/* right line */}
                                        <div className={`flex-1 h-0.5 ${isLast ? "opacity-0" : done && STATUS_ORDER.indexOf(key) < currentStatusIdx ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"}`} />
                                    </div>
                                    {/* label */}
                                    <p className={`mt-2 text-center text-[11px] font-medium leading-tight px-1 ${active ? "text-emerald-600 dark:text-emerald-400" : done ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400"}`}>
                                        {label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Items ── */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mb-5">
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 mb-4">
                    <ShoppingBag size={14} /> Itens do Pedido
                </h2>
                <div className="space-y-3">
                    {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                            <div>
                                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                                    {item.productTitle}
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {item.quantity} × {fmt(item.unitPrice)}
                                </p>
                            </div>
                            <span className="text-sm font-bold text-zinc-900 dark:text-white">
                                {fmt(item.totalPrice)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                    <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
                        <span>Subtotal</span>
                        <span>{fmt(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
                        <span>Frete {order.shippingMethod ? `(${order.shippingMethod})` : ""}</span>
                        <span>{fmt(order.shippingPrice)}</span>
                    </div>
                    {order.discount > 0 && (
                        <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                            <span>Desconto</span>
                            <span>- {fmt(order.discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="font-bold text-zinc-900 dark:text-white">Total</span>
                        <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                            {fmt(order.total)}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Delivery address ── */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 mb-5">
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 mb-3">
                    <MapPin size={14} /> Endereço de Entrega
                </h2>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    {order.address}, {order.number}
                    {order.complement ? ` — ${order.complement}` : ""}
                </p>
                {order.neighborhood && (
                    <p className="text-sm text-zinc-500">{order.neighborhood}</p>
                )}
                <p className="text-sm text-zinc-500">
                    {order.city} / {order.state} · CEP {order.cep}
                </p>
                {order.trackingCode && (
                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs text-zinc-500">Código de rastreio</p>
                        <p className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200">
                            {order.trackingCode}
                        </p>
                    </div>
                )}
            </div>

            {/* ── Customer info ── */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 mb-3">
                    <User size={14} /> Dados do Cliente
                </h2>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{order.customerName}</p>
                <p className="text-sm text-zinc-500">{order.customerEmail}</p>
                {order.customerPhone && (
                    <p className="text-sm text-zinc-500">{order.customerPhone}</p>
                )}
                {order.customerDocument && (
                    <p className="text-sm text-zinc-500">Doc: {order.customerDocument}</p>
                )}
            </div>
        </main>
    );
}
