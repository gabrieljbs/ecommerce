"use client";

import { useActionState } from "react";
import { placeOrder } from "@/action/place-order";
import { Loader2 } from "lucide-react";

interface AddressData {
    cep?: string;
    state?: string;
    city?: string;
    street?: string;
    neighborhood?: string;
}

interface CheckoutFormProps {
    addressData: AddressData | null;
    cartCep: string;
}

const initialState = {
    error: ""
};

export default function CheckoutForm({ addressData, cartCep }: CheckoutFormProps) {
    const [state, action, isPending] = useActionState(placeOrder, initialState);

    return (
        <form action={action} className="space-y-4">
            {state?.error && (
                <div className="p-3 bg-red-50 text-red-500 rounded-lg text-sm border border-red-200">
                    {state.error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">CEP</label>
                    <input
                        type="text"
                        name="cep"
                        defaultValue={cartCep}
                        readOnly
                        className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 cursor-not-allowed"
                    />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Estado</label>
                    <input
                        type="text"
                        name="state"
                        defaultValue={addressData?.state}
                        readOnly
                        className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 cursor-not-allowed"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Cidade</label>
                <input
                    type="text"
                    name="city"
                    defaultValue={addressData?.city}
                    readOnly
                    className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 cursor-not-allowed"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Bairro</label>
                <input
                    type="text"
                    name="neighborhood"
                    defaultValue={addressData?.neighborhood}
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Rua / Logradouro</label>
                <input
                    type="text"
                    name="address"
                    defaultValue={addressData?.street}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Número</label>
                    <input
                        type="text"
                        name="number"
                        required
                        className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Complemento</label>
                    <input
                        type="text"
                        name="complement"
                        className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    />
                </div>
            </div>

            <div className="pt-6">
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white py-4 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-200 dark:shadow-none mb-4 flex items-center justify-center"
                >
                    {isPending ? <Loader2 className="animate-spin" /> : "Confirmar Pedido"}
                </button>
                <p className="text-xs text-center text-zinc-500">
                    Ao confirmar, você será redirecionado para seus pedidos.
                </p>
            </div>
        </form>
    );
}
