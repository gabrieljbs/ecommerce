import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Truck, FileText, CreditCard } from "lucide-react";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {

    const user = await auth();

    if (!user) {
        redirect("/login");
    }

    const { id } = await params;

    const order = await db.query.orders.findFirst({
        where: eq(orders.id, id),
        with: {
            items: true,
            payments: true,
            user: true
        }
    });

    if (!order || order.userId !== user.id) {
        return (
            <div className="text-center py-12">
                <p className="text-zinc-500">Pedido não encontrado ou você não tem permissão para acessá-lo.</p>
                <Link href="/profile" className="mt-4 inline-block text-indigo-600 font-semibold hover:underline">Voltar aos meus pedidos</Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">

            <div className="flex items-center gap-4 mb-6">
                <Link href="/profile" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                        Detalhes do Pedido
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">
                            {order.status}
                        </span>
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">#{order.id.split('-')[0]}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Order Details */}
                <div className="md:col-span-2 space-y-6">

                    {/* Items */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
                            <FileText size={18} /> Resumo dos Itens
                        </h3>

                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {order.items.map((item) => (
                                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                                    <div className="relative w-20 h-20 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex-shrink-0">
                                        <Image
                                            src={item.productImage || "/placeholder.svg"}
                                            alt={item.productTitle}
                                            fill
                                            className="object-cover"
                                            sizes="80px"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
                                            {item.productTitle}
                                        </h4>
                                        <p className="text-sm text-zinc-500">
                                            Valor Unitário: {Number(item.unitPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </p>
                                        <p className="text-sm text-zinc-500">
                                            Quantidade: {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-600 dark:text-emerald-400">
                                            {Number(item.totalPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery & Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/50 pb-4 text-zinc-900 dark:text-white">
                                <Truck size={18} /> Entrega
                            </h3>
                            <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                                <p><span className="font-semibold text-zinc-900 dark:text-zinc-300">Método:</span> {order.shippingMethod}</p>
                                <p><span className="font-semibold text-zinc-900 dark:text-zinc-300">Valor:</span> {order.shippingPrice === 0 ? 'Grátis' : Number(order.shippingPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                {order.trackingCode && (
                                    <p><span className="font-semibold text-zinc-900 dark:text-zinc-300">Rastreio:</span> <span className="text-indigo-600 font-mono tracking-wider">{order.trackingCode}</span></p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/50 pb-4 text-zinc-900 dark:text-white">
                                <MapPin size={18} /> Endereço
                            </h3>
                            <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                                <p className="font-semibold text-zinc-900 dark:text-zinc-300">{order.customerName}</p>
                                <p>{order.address}, {order.number} {order.complement && ` - ${order.complement}`}</p>
                                <p>{order.neighborhood}, {order.city} - {order.state}</p>
                                <p>CEP: {order.cep}</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sidebar Order Total */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sticky top-24">
                        <h3 className="font-bold text-lg mb-4 text-zinc-900 dark:text-white">Resumo Financeiro</h3>

                        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 mb-6 border-b border-zinc-100 dark:border-zinc-800/50 pb-6">
                            <div className="flex justify-between">
                                <span>Subtotal Original</span>
                                <span className="font-medium text-zinc-900 dark:text-zinc-300">{Number(order.subtotal / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Frete</span>
                                <span className="font-medium text-zinc-900 dark:text-zinc-300">{Number(order.shippingPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                    <span>Descontos</span>
                                    <span className="font-medium">-{Number(order.discount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-end mb-6">
                            <span className="font-bold text-zinc-900 dark:text-white">Total</span>
                            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{Number(order.total / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800/50">
                            <div className="flex items-center gap-2 mb-2">
                                <CreditCard size={16} className="text-zinc-500" />
                                <span className="text-sm font-bold text-zinc-900 dark:text-white">Informação de Pagamento</span>
                            </div>
                            {order.payments && order.payments.length > 0 ? (
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                                    <p className="uppercase text-xs font-semibold tracking-wider text-zinc-500 mb-2">Método: {order.payments[0].method === 'pix' ? 'PIX' : order.payments[0].method}</p>
                                    <p className="flex justify-between">
                                        Status: <span className="font-semibold text-zinc-900 dark:text-white">{order.payments[0].status}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        Data: <span className="font-semibold text-zinc-900 dark:text-white">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-zinc-500">Nenhum pagamento registrado.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
