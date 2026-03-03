import { auth } from "@/lib/auth";
import { getUserOrders } from "@/db/queries/orders";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";

export default async function ProfilePage() {
    const user = await auth();

    if (!user) {
        redirect("/login");
    }

    const orders = await getUserOrders(user.id);

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Package size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Meus Pedidos</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Acompanhe o status e histórico de suas compras.</p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                    <Package size={48} className="mx-auto text-zinc-400 mb-4 opacity-50" />
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Nenhum pedido encontrado</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
                        Você ainda não realizou nenhuma compra em nossa loja.
                    </p>
                    <Link
                        href="/product"
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Ver Produtos
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                            {/* Order Header */}
                            <div className="bg-zinc-50 dark:bg-zinc-950/50 px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800">
                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                                        Pedido Realizado em
                                    </p>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                        {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                                        Total
                                    </p>
                                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                                        {Number((order.total || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </div>

                                <div className="sm:text-right">
                                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                                        Status
                                    </p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="px-6 py-4 divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                {order.items.map((item) => (
                                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                                        <div className="relative w-16 h-16 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex-shrink-0">
                                            <Image
                                                src={item.productImage || "/placeholder.svg"}
                                                alt={item.productTitle}
                                                fill
                                                className="object-cover"
                                                sizes="64px"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">
                                                {item.productTitle}
                                            </h4>
                                            <p className="text-sm text-zinc-500 mt-1">
                                                Qtd: {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-zinc-900 dark:text-white">
                                                {Number(item.unitPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Action */}
                            <div className="bg-white dark:bg-zinc-900 px-6 py-3 border-t border-zinc-200 dark:border-zinc-800">
                                <Link
                                    href={`/profile/pedido/${order.id}`}
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
                                >
                                    Ver detalhes completos do pedido
                                    <ChevronRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
