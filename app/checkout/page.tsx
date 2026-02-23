import { auth } from "@/lib/auth";
import { getCartSession } from "@/lib/cart-session";
import { getCart } from "@/db/queries/get-cart";
import { redirect } from "next/navigation";
import CheckoutStepper from "@/components/Checkout/CheckoutStepper";
import { getAddressFromCep } from "@/action/get-address-From-cep";



export default async function CheckoutPage() {
    const user = await auth();
    if (!user) {
        redirect("/login?redirect=/checkout");
    }

    const sessionId = await getCartSession();
    const cart = await getCart(sessionId);

    if (!cart || cart.items.length === 0) {
        redirect("/cart");
    }

    if (!cart.shippingZipcode || !cart.shippingPrice) {
        redirect("/cart"); // Precisa calcular e selecionar frete antes
    }

    // TypeScript narrowing após redirects
    const safeCart = cart!;

    const addressData = await getAddressFromCep(safeCart.shippingZipcode!);
    const shippingPrice = Number(safeCart.shippingPrice);
    const subtotal = safeCart.items.reduce(
        (sum, item) => sum + item.quantity * Number(item.product.price),
        0
    );
    const total = subtotal + shippingPrice;

    return (
        <main className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-white">
                Finalizar Pedido
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mb-10 text-sm">
                Preencha as informações abaixo para concluir sua compra.
            </p>

            <div>

                {/* ── Stepper (multi-etapas) ── */}
                <div>
                    <CheckoutStepper
                        cartCep={safeCart.shippingZipcode!}
                        addressData={addressData}
                        shippingPrice={shippingPrice}
                        shippingMethod={safeCart.shippingMethod ?? null}
                        subtotal={subtotal}
                        total={total}
                        cartItems={safeCart.items}
                        userName={user!.name}
                        userEmail={user!.email}
                    />
                </div>
            </div>
        </main>
    );
}
