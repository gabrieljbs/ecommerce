"use client";

import { useActionState, useTransition } from "react";
import { deliveryCalc } from "@/action/deliveryCalc";
import { saveShipping } from "@/action/save-shipping";
import { Loader2, Truck, Calendar, Package, Check } from "lucide-react";

const initialState: any = {
    data: null,
    cep: "",
    error: ""
};

interface DeliveryProps {
    cartId?: string;
    selectedMethod?: string | null;
}

export default function Delivery({ cartId, selectedMethod }: DeliveryProps) {
    const [state, action, isPending] = useActionState(deliveryCalc, initialState);
    const [isSaving, startTransition] = useTransition();

    const handleSelectShipping = (option: any, cep: string) => {
        if (!cartId || !cep) return;

        startTransition(async () => {
            await saveShipping(
                cartId,
                parseFloat(option.price),
                `${option.name} (${option.company.name})`,
                option.delivery_time,
                cep
            );
        });
    };


    return (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-4 text-zinc-800 dark:text-zinc-200 font-medium">
                <Truck size={20} />
                <p>Calcular e Escolher Frete</p>
            </div>

            <form action={action} className="flex flex-col gap-2">
                {cartId && <input type="hidden" name="cartId" value={cartId} />}
                <input
                    type="text"
                    name="cep"
                    placeholder="00000-000"
                    maxLength={9}
                    className="flex-1 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-zinc-400 dark:text-white"
                />
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:opacity-90 disabled:opacity-70 transition-all flex items-center justify-center w-[100px]"
                >
                    {isPending ? <Loader2 className="animate-spin" size={18} /> : "Calcular"}
                </button>
            </form>

            {state?.error && (
                <p className="mt-3 text-sm text-red-500 font-medium">
                    {state.error}
                </p>
            )}

            {state?.data && Array.isArray(state.data) && (
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">

                    {/* Aviso quando visualizado fora do carrinho */}
                    {!cartId && (
                        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <span className="text-amber-500 mt-0.5 shrink-0">ⓘ</span>
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                Adicione o produto ao carrinho para selecionar uma opção de entrega.
                            </p>
                        </div>
                    )}

                    {state.data.map((option: any) => {
                        if (option.error) return null;
                        const isSelected = selectedMethod === `${option.name} (${option.company.name})`;

                        return (
                            <div key={option.id} className={`flex flex-col gap-1 p-3 bg-white dark:bg-zinc-800 rounded-lg border transition-all ${isSelected ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-zinc-200 dark:border-zinc-700'}`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Package size={16} className="text-zinc-500" />
                                        <span className="font-medium text-zinc-800 dark:text-zinc-200 text-sm">
                                            {option.name} ({option.company.name})
                                        </span>
                                    </div>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                        {Number(option.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                        <Calendar size={12} />
                                        <span>Chega em até <strong>{option.delivery_time} dias úteis</strong></span>
                                    </div>

                                    {cartId && (
                                        <button
                                            onClick={() => handleSelectShipping(option, state?.cep || "")}
                                            disabled={isSaving || isSelected}
                                            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${isSelected
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-default'
                                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600'
                                                }`}
                                        >
                                            {isSaving && !isSelected ? <Loader2 className="animate-spin h-3 w-3" /> : (isSelected ? "Selecionado" : "Escolher")}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}