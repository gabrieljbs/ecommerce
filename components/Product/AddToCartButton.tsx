"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addToCart } from "@/action/add-to-cart";
import { ShoppingCart, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

function SubmitButton({ isOutOfStock }: { isOutOfStock: boolean }) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending || isOutOfStock}
            className={`w-full py-4 px-8 rounded-full font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isOutOfStock
                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                : "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:opacity-90 disabled:opacity-60"
                }`}
        >
            {pending ? (
                <>
                    <Loader2 size={18} className="animate-spin" />
                    Adicionando…
                </>
            ) : isOutOfStock ? (
                <>
                    <AlertCircle size={18} />
                    Fora de Estoque
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

export default function AddToCartButton({ productId, stock }: { productId: string, stock: number }) {
    const [state, action] = useActionState(addToCart, initialState);
    const isOutOfStock = stock <= 0;

    return (
        <form action={action} className="flex flex-col gap-3">
            <input type="hidden" name="productId" value={productId} />

            <div className="flex items-center gap-4 mb-2">
                <label htmlFor="quantity" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Quantidade:
                </label>
                <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    defaultValue={1}
                    min={1}
                    max={stock}
                    disabled={isOutOfStock}
                    className="w-20 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
                <span className="text-xs text-zinc-500">
                    {stock > 0 ? `${stock} em estoque` : "Esgotado"}
                </span>
            </div>

            <SubmitButton isOutOfStock={isOutOfStock} />
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
