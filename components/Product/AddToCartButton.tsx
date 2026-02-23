"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addToCart } from "@/action/add-to-cart";
import { ShoppingCart, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 py-4 px-8 rounded-full font-semibold hover:opacity-90 disabled:opacity-60 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
            {pending ? (
                <>
                    <Loader2 size={18} className="animate-spin" />
                    Adicionando…
                </>
            ) : (
                <>
                    <ShoppingCart size={18} />
                    Adicionar ao Carrinho
                </>
            )}
        </button>
    );
}

const initialState = { success: false, error: "" };

export default function AddToCartButton({ productId }: { productId: string }) {
    const [state, action] = useActionState(addToCart, initialState);

    return (
        <form action={action} className="flex flex-col gap-2">
            <input type="hidden" name="productId" value={productId} />
            <SubmitButton />
            {state?.error && (
                <p className="flex items-center gap-1.5 text-sm text-red-500">
                    <AlertCircle size={14} />
                    {state.error}
                </p>
            )}
            {state?.success && (
                <p className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={14} />
                    Item adicionado ao carrinho!
                </p>
            )}
        </form>
    );
}
