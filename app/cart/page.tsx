export const runtime = "nodejs";

import { getCart } from "@/db/queries/get-cart";
import { getCartSession } from "@/lib/cart-session";
import { CartItem } from "@/components/Cart/CartItem";

export default async function CartPage() {
    const sessionId = await getCartSession();
    const cart = await getCart(sessionId);

    if (!cart || cart.items.length === 0) {
        return <h1>Seu carrinho está vazio</h1>;
    }

    const total = cart.items.reduce(
        (sum, item) => sum + item.quantity * Number(item.product.price),
        0
    );

    return (
        <main className="container mx-auto p-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">Seu Carrinho</h1>

            <div className="space-y-4">
                {cart.items.map(item => (
                    <CartItem key={item.id} item={item} />
                ))}
            </div>

            <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-8">
                    <span className="text-zinc-500 font-medium">Total do Pedido</span>
                    <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
                        R$ {total.toFixed(2)}
                    </span>
                </div>

                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-full font-bold transition-colors shadow-lg shadow-emerald-200 dark:shadow-none">
                    Finalizar Compra
                </button>
            </div>
        </main>
    );
}
