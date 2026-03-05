"use client";

import { useActionState, useState } from "react";
import { placeOrder } from "@/action/place-order";
import { Loader2, MapPin, User, ShoppingBag, Check, ChevronRight } from "lucide-react";

interface AddressData {
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
}

interface CartItem {
    id: string;
    quantity: number;
    product: {
        title: string;
        price: number;
    };
}

interface CheckoutStepperProps {
    cartCep: string;
    addressData: AddressData | null;
    shippingPrice: number;
    shippingMethod: string | null;
    subtotal: number;
    total: number;
    cartItems: CartItem[];
    userName: string;
    userEmail: string;
}

const STEPS = [
    { id: 1, label: "Endereço", Icon: MapPin },
    { id: 2, label: "Seus Dados", Icon: User },
    { id: 3, label: "Revisão", Icon: ShoppingBag },
];

const inputClass =
    "w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all text-zinc-900 dark:text-white";
const readonlyClass =
    "w-full px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 cursor-not-allowed";
const labelClass =
    "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1";

export default function CheckoutStepper({
    cartCep,
    addressData,
    shippingPrice,
    shippingMethod,
    subtotal,
    total,
    cartItems,
    userName,
    userEmail,
}: CheckoutStepperProps) {
    const [step, setStep] = useState(1);
    const [state, action, isPending] = useActionState(placeOrder, { error: "" });

    // ── Etapa 1: Endereço ─────────────────────────────────────────────────────
    const [address, setAddress] = useState(addressData?.street ?? "");
    const [number, setNumber] = useState("");
    const [complement, setComplement] = useState("");
    const [neighborhood, setNeighborhood] = useState(addressData?.neighborhood ?? "");
    const city = addressData?.city ?? "";
    const stateCode = addressData?.state ?? "";

    // ── Etapa 2: Dados do cliente ─────────────────────────────────────────────
    const [custName, setCustName] = useState(userName);
    const [custEmail, setCustEmail] = useState(userEmail);
    const [custPhone, setCustPhone] = useState("");
    const [custDocument, setCustDocument] = useState("");

    const goNext = () => setStep(s => Math.min(s + 1, 3));
    const goBack = () => setStep(s => Math.max(s - 1, 1));

    return (
        <div>
            {/* ── Indicador de etapas ── */}
            <nav className="flex items-center mb-10">
                {STEPS.map(({ id, label, Icon }, i) => {
                    const isActive = step === id;
                    const isDone = step > id;
                    return (
                        <div key={id} className="flex items-center flex-1 min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${isDone ? "bg-primary-500 text-white" :
                                    isActive ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" :
                                        "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                                    }`}>
                                    {isDone ? <Check size={16} /> : <Icon size={16} />}
                                </div>
                                <span className={`text-sm font-medium truncate hidden sm:block transition-colors ${isActive ? "text-zinc-900 dark:text-white" : "text-zinc-400"
                                    }`}>
                                    {label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <ChevronRight size={16} className="mx-2 shrink-0 text-zinc-300 dark:text-zinc-600" />
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* ══════════════════════════════════════════════════════════════
                Etapa 1 — Endereço de Entrega
            ══════════════════════════════════════════════════════════════ */}
            {step === 1 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                        Endereço de Entrega
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>CEP</label>
                            <input type="text" value={cartCep} readOnly className={readonlyClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Estado</label>
                            <input type="text" value={stateCode} readOnly className={readonlyClass} />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Cidade</label>
                        <input type="text" value={city} readOnly className={readonlyClass} />
                    </div>

                    <div>
                        <label className={labelClass}>Bairro</label>
                        <input
                            type="text"
                            value={neighborhood}
                            onChange={e => setNeighborhood(e.target.value)}
                            placeholder="Bairro"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Rua / Logradouro <span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            placeholder="Ex: Av. Paulista"
                            className={inputClass}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className={labelClass}>Número <span className="text-red-400">*</span></label>
                            <input
                                type="text"
                                value={number}
                                onChange={e => setNumber(e.target.value)}
                                placeholder="123"
                                className={inputClass}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className={labelClass}>Complemento</label>
                            <input
                                type="text"
                                value={complement}
                                onChange={e => setComplement(e.target.value)}
                                placeholder="Apto, Bloco, Sala..."
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={goNext}
                        disabled={!address.trim() || !number.trim()}
                        className="w-full mt-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 rounded-xl font-bold hover:opacity-90 disabled:opacity-40 transition-all"
                    >
                        Continuar
                    </button>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                Etapa 2 — Dados do Cliente
            ══════════════════════════════════════════════════════════════ */}
            {step === 2 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                        Seus Dados
                    </h2>

                    <div>
                        <label className={labelClass}>Nome completo <span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            value={custName}
                            onChange={e => setCustName(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>E-mail <span className="text-red-400">*</span></label>
                        <input
                            type="email"
                            value={custEmail}
                            onChange={e => setCustEmail(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>CPF / CNPJ</label>
                        <input
                            type="text"
                            value={custDocument}
                            onChange={e => setCustDocument(e.target.value)}
                            placeholder="000.000.000-00"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Telefone / WhatsApp</label>
                        <input
                            type="tel"
                            value={custPhone}
                            onChange={e => setCustPhone(e.target.value)}
                            placeholder="(00) 00000-0000"
                            className={inputClass}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={goBack}
                            className="flex-1 py-4 rounded-xl font-bold border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-zinc-700 dark:text-zinc-300">
                            Voltar
                        </button>
                        <button type="button" onClick={goNext}
                            disabled={!custName.trim() || !custEmail.trim()}
                            className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 rounded-xl font-bold hover:opacity-90 disabled:opacity-40 transition-all">
                            Continuar
                        </button>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                Etapa 3 — Revisão & Confirmação
            ══════════════════════════════════════════════════════════════ */}
            {step === 3 && (
                <form action={action} className="space-y-5">
                    {/* Hidden fields com todos os dados coletados */}
                    <input type="hidden" name="address" value={address} />
                    <input type="hidden" name="number" value={number} />
                    <input type="hidden" name="complement" value={complement} />
                    <input type="hidden" name="neighborhood" value={neighborhood} />
                    <input type="hidden" name="city" value={city} />
                    <input type="hidden" name="state" value={stateCode} />
                    <input type="hidden" name="customerName" value={custName} />
                    <input type="hidden" name="customerEmail" value={custEmail} />
                    <input type="hidden" name="customerPhone" value={custPhone} />
                    <input type="hidden" name="customerDocument" value={custDocument} />

                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                        Revisão do Pedido
                    </h2>

                    {/* Card: Endereço */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                <MapPin size={14} /> Endereço de Entrega
                            </span>
                            <button type="button" onClick={() => setStep(1)}
                                className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 underline underline-offset-2">
                                Editar
                            </button>
                        </div>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">
                            {address}, {number}{complement ? ` — ${complement}` : ""}
                        </p>
                        {neighborhood && (
                            <p className="text-sm text-zinc-500">{neighborhood}</p>
                        )}
                        <p className="text-sm text-zinc-500">
                            {city} / {stateCode} &nbsp;·&nbsp; CEP {cartCep}
                        </p>
                    </div>

                    {/* Card: Dados do Cliente */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                <User size={14} /> Seus Dados
                            </span>
                            <button type="button" onClick={() => setStep(2)}
                                className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 underline underline-offset-2">
                                Editar
                            </button>
                        </div>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">{custName}</p>
                        <p className="text-sm text-zinc-500">{custEmail}</p>
                        {custPhone && <p className="text-sm text-zinc-500">{custPhone}</p>}
                        {custDocument && <p className="text-sm text-zinc-500">Doc: {custDocument}</p>}
                    </div>

                    {/* Card: Frete */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Frete</p>
                            {shippingMethod && (
                                <p className="text-xs text-zinc-500">{shippingMethod}</p>
                            )}
                        </div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {Number(shippingPrice / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                    </div>

                    {/* Itens */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-3">
                        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                            <ShoppingBag size={14} /> Itens ({cartItems.length})
                        </p>
                        {cartItems.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-zinc-600 dark:text-zinc-400">
                                    {item.quantity}× {item.product.title}
                                </span>
                                <span className="font-medium text-zinc-900 dark:text-white">
                                    {Number((item.quantity * item.product.price) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </span>
                            </div>
                        ))}
                        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                            <span className="font-bold text-zinc-900 dark:text-white">Total</span>
                            <span className="text-xl font-black text-primary-600 dark:text-primary-400">
                                {Number(total / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </span>
                        </div>
                    </div>

                    {state?.error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-200 dark:border-red-800">
                            {state.error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={goBack}
                            className="flex-1 py-4 rounded-xl font-bold border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-zinc-700 dark:text-zinc-300">
                            Voltar
                        </button>
                        <button type="submit" disabled={isPending}
                            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-70 text-white py-4 rounded-xl font-bold transition-colors shadow-lg shadow-primary-200 dark:shadow-none flex items-center justify-center gap-2">
                            {isPending ? <Loader2 className="animate-spin" size={20} /> : "Confirmar Pedido"}
                        </button>
                    </div>

                    <p className="text-xs text-center text-zinc-400">
                        Ao confirmar, você será redirecionado para seus pedidos.
                    </p>
                </form>
            )}
        </div>
    );
}
