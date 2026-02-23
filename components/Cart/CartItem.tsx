"use client";

import { useTransition } from "react";
import { removeCartItem } from "@/action/remove-cart-item";
import { updateCartItem } from "@/action/update-cart-item";

interface CartItemProps {
    item: {
        id: string;
        quantity: number;
        product: {
            title: string;
            price: number;
        };
    };
}

export function CartItem({ item }: CartItemProps) {
    const [isPending, startTransition] = useTransition();

    const handleRemove = () => {
        startTransition(async () => {
            await removeCartItem(item.id);
        });
    };

    const handleUpdate = (quantity: number) => {
        if (quantity < 1) return;
        startTransition(async () => {
            await updateCartItem(item.id, quantity);
        });
    };

    return (
        <div className="flex items-center justify-between p-4 border rounded-xl bg-white dark:bg-zinc-900 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col gap-3">
                <h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">
                    {item.product.title}
                </h2>

                <div className="flex items-center gap-4">
                    <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                        <button
                            disabled={isPending || item.quantity <= 1}
                            onClick={() => handleUpdate(item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-600 dark:text-zinc-400 transition-colors"
                            aria-label="Diminuir quantidade"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M5 12h14" />
                            </svg>
                        </button>
                        <span className="w-10 h-8 flex items-center justify-center text-sm font-medium text-zinc-900 dark:text-zinc-50 bg-zinc-50 dark:bg-zinc-900/50">
                            {item.quantity}
                        </span>
                        <button
                            disabled={isPending}
                            onClick={() => handleUpdate(item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-600 dark:text-zinc-400 transition-colors"
                            aria-label="Aumentar quantidade"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                            </svg>
                        </button>
                    </div>

                    <button
                        disabled={isPending}
                        onClick={handleRemove}
                        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium disabled:opacity-50 transition-colors px-2 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line x1="10" x2="10" y1="11" y2="17" />
                            <line x1="14" x2="14" y1="11" y2="17" />
                        </svg>
                        Remover
                    </button>
                </div>
            </div>

            <div className="text-right">
                <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                    {Number(item.quantity * Number(item.product.price) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                    {Number(item.product.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} cada
                </p>
            </div>
        </div>
    );
}
