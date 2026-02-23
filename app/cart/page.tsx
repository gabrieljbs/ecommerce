export const runtime = "nodejs";

import { getCart } from "@/db/queries/get-cart";
import { getCartSession } from "@/lib/cart-session";
import { CartItem } from "@/components/Cart/CartItem";
import Link from "next/link";
import { auth } from "@/lib/auth";

import Delivery from "@/components/Delivery/delivery";

export default async function CartPage() {
    const sessionId = await getCartSession();
    const cart = await getCart(sessionId);
    const user = await auth();

    if (!cart || cart.items.length === 0) {
        return (
            <main className="container mx-auto p-8 max-w-2xl min-h-[50vh] flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-zinc-800 to-zinc-500 bg-clip-text text-transparent mb-4">Seu carrinho está vazio</h1>
                <p className="text-zinc-500">Adicione produtos para começar suas compras.</p>
            </main>
        );
    }

    const subtotal = cart.items.reduce(
        (sum, item) => sum + item.quantity * Number(item.product.price),
        0
    );

    const shippingPrice = cart.shippingPrice ? Number(cart.shippingPrice) : 0;
    const total = subtotal + shippingPrice;

    return (
        <main className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Seu Carrinho</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-4">
                        {cart.items.map(item => (
                            <CartItem key={item.id} item={item} />
                        ))}
                    </div>

                    <div className="mt-8">
                        <div className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">Entrega</div>
                        <Delivery cartId={cart.id} selectedMethod={cart.shippingMethod} />
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">Resumo do Pedido</h2>

                        <div className="space-y-3 mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                                <span>Subtotal</span>
                                <span> {Number(subtotal / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>

                            <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                                <span>Frete</span>
                                {shippingPrice > 0 ? (
                                    <span className="text-zinc-900 dark:text-zinc-200">
                                        {Number(shippingPrice / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                ) : (
                                    <span className="text-zinc-400 text-sm">Não calculado</span>
                                )}
                            </div>

                            {cart.shippingMethod && (
                                <div className="text-xs text-zinc-500 dark:text-zinc-500 text-right">
                                    Via {cart.shippingMethod} • {cart.shippingDays} dias
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center mb-8">
                            <span className="text-lg font-bold text-zinc-900 dark:text-white">Total</span>
                            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                {Number(total / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>

                        {shippingPrice > 0 ? (
                            user ? (
                                <Link
                                    href="/checkout"
                                    className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                >
                                    <span>Fechar Pedido</span>
                                </Link>
                            ) : (
                                <div className="space-y-2">
                                    <Link
                                        href="/login?callbackUrl=/checkout"
                                        className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                    >
                                        <span>Fechar Pedido</span>
                                    </Link>
                                    <p className="text-xs text-center text-amber-600 dark:text-amber-400">
                                        Faça login para continuar.
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="space-y-2">
                                <button
                                    disabled
                                    className="w-full bg-zinc-300 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 py-4 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <span>Fechar Pedido</span>
                                </button>
                                <p className="text-xs text-center text-amber-600 dark:text-amber-400">
                                    Calcule e selecione um frete antes de continuar.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
