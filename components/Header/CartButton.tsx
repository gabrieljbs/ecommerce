import Link from "next/link";
import { getCart } from "@/db/queries/get-cart";
import { getCartSession } from "@/lib/cart-session";

export default async function CartButton() {
    const sessionId = await getCartSession();
    const cart = await getCart(sessionId);

    const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
        <Link href="/cart" className="relative p-2.5 hover:bg-zinc-100 rounded-full transition-colors group flex items-center justify-center">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-zinc-700 group-hover:text-primary-600 transition-colors"
            >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>

            {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {itemCount}
                </span>
            )}
        </Link>
    );
}
