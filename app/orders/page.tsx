export const runtime = "nodejs";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    ShoppingBag,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    CreditCard,
    ChevronRight,
    ArrowRight,
    QrCode,
} from "lucide-react";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    awaiting_payment: {
        label: "Aguardando Pagamento",
        icon: CreditCard,
        bg: "bg-amber-50 dark:bg-amber-950/30",
        text: "text-amber-700 dark:text-amber-400",
        dot: "bg-amber-500",
    },
    paid: {
        label: "Pagamento Confirmado",
        icon: CheckCircle2,
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        text: "text-emerald-700 dark:text-emerald-400",
        dot: "bg-emerald-500",
    },
    shipped: {
        label: "Enviado",
        icon: Truck,
        bg: "bg-primary-50 dark:bg-primary-950/30",
        text: "text-primary-700 dark:text-primary-400",
        dot: "bg-primary-500",
    },
    delivered: {
        label: "Entregue",
        icon: CheckCircle2,
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        text: "text-emerald-700 dark:text-emerald-400",
        dot: "bg-emerald-500",
    },
    cancelled: {
        label: "Cancelado",
        icon: XCircle,
        bg: "bg-red-50 dark:bg-red-950/30",
        text: "text-red-700 dark:text-red-400",
        dot: "bg-red-500",
    },
} as const;

function fmt(cents: number) {
    return Number(cents / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function fmtDate(date: Date) {
    return new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default async function OrdersPage() {
    const user = await auth();
    if (!user) redirect("/login?callbackUrl=/orders");

    const userOrders = await db.query.orders.findMany({
        where: eq(orders.userId, user.id),
        orderBy: [desc(orders.createdAt)],
        with: {
            items: true,
        },
    });

    return (
        <main className="container mx-auto px-4 py-10 max-w-3xl min-h-[60vh]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-zinc-900 dark:bg-white rounded-xl">
                    <Package size={20} className="text-white dark:text-zinc-900" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        Meus Pedidos
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {userOrders.length === 0
                            ? "Nenhum pedido ainda"
                            : `${userOrders.length} pedido${userOrders.length > 1 ? "s" : ""} encontrado${userOrders.length > 1 ? "s" : ""}`}
                    </p>
                </div>
            </div>

            {/* Empty state */}
            {userOrders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="p-6 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                        <ShoppingBag size={40} className="text-zinc-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">
                        Você ainda não fez nenhum pedido
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center max-w-xs">
                        Explore nossos produtos e faça seu primeiro pedido!
                    </p>
                    <Link
                        href="/product"
                        className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                    >
                        Ver Produtos <ArrowRight size={16} />
                    </Link>
                </div>
            )}

            {/* Orders list */}
            <div className="space-y-4">
                {userOrders.map((order) => {
                    const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.awaiting_payment;
                    const StatusIcon = cfg.icon;
                    const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);

                    return (
                        <div key={order.id} className="relative">
                            <Link
                                href={`/orders/${order.id}`}
                                className="group block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all"
                            >
                                {/* Top row */}
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-0.5">
                                            Pedido #{order.id.slice(0, 8).toUpperCase()}
                                        </p>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            {fmtDate(order.createdAt)}
                                        </p>
                                    </div>

                                    {/* Status badge */}
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                        {cfg.label}
                                    </span>
                                </div>

                                {/* Items preview */}
                                <div className="flex items-center gap-2 mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                                    <ShoppingBag size={14} className="shrink-0" />
                                    <span>
                                        {order.items
                                            .slice(0, 2)
                                            .map((i) => `${i.quantity}× ${i.productTitle}`)
                                            .join(", ")}
                                        {order.items.length > 2 && (
                                            <span className="text-zinc-400">
                                                {" "}+{order.items.length - 2} item(s)
                                            </span>
                                        )}
                                    </span>
                                </div>

                                {/* Bottom row */}
                                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex gap-4 text-sm">
                                        <span className="text-zinc-500 dark:text-zinc-400">
                                            {totalItems} item{totalItems > 1 ? "s" : ""}
                                        </span>
                                        <span className="font-bold text-zinc-900 dark:text-white">
                                            {fmt(order.total)}
                                        </span>
                                    </div>
                                    <ChevronRight
                                        size={18}
                                        className="text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all"
                                    />
                                </div>
                            </Link>

                            {/* Botão Pagar Agora — aparece sobre o card para pedidos aguardando pagamento */}
                            {order.status === "awaiting_payment" && (
                                <Link
                                    href={`/payments?orderId=${order.id}`}
                                    className="absolute bottom-4 right-12 flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs transition-colors shadow-md shadow-amber-200 dark:shadow-none"
                                >
                                    <QrCode size={13} />
                                    Pagar Agora
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>
        </main>
    );
}