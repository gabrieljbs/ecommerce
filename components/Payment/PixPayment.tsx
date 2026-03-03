"use client";

import { useState, useEffect, useCallback } from "react";
import { processPayment, checkPaymentStatus, mockPaySandboxPix } from "@/action/payment";
import {
    QrCode,
    Copy,
    Check,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Loader2,
    Zap,
    Bug,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentConfigProps {
    orderId: string;
    total: number;       // em centavos
    orderStatus: string;
    payerEmail?: string;
}

type Stage = "idle" | "loading" | "qr" | "paid" | "error";

export default function PagSeguroPayment({ orderId, total, orderStatus, payerEmail }: PaymentConfigProps) {
    const router = useRouter();

    const [stage, setStage] = useState<Stage>(orderStatus === "paid" ? "paid" : "idle");
    const [qrCode, setQrCode] = useState("");
    const [copied, setCopied] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const [pollCount, setPollCount] = useState(0);
    const [mocking, setMocking] = useState(false);

    function fmt(cents: number) {
        return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    async function handleCopy() {
        await navigator.clipboard.writeText(qrCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    }

    async function handleMockPayment() {
        setMocking(true);
        try {
            await mockPaySandboxPix(orderId);
            setStage("paid");
            router.refresh();
        } catch {
            setMocking(false);
        }
    }

    const poll = useCallback(async () => {
        try {
            const res = await checkPaymentStatus(orderId);
            setPollCount((c) => c + 1);
            if (res.paid) {
                setStage("paid");
                router.refresh();
            }
        } catch { /* erro silencioso em caso de lentidão */ }
    }, [orderId, router]);

    useEffect(() => {
        if (stage !== "qr") return;
        const interval = setInterval(poll, 5000);
        return () => clearInterval(interval);
    }, [stage, poll]);

    async function handleGerarPix() {
        setStage("loading");
        try {
            // Mandamos as chaves obrigatórias como formData
            const result = await processPayment(orderId, {
                payment_method_id: "pix",
                payer: {
                    name: "Cliente Teste",
                    email: payerEmail || "",
                    cpf: "12345678909",
                }
            });

            if (result.qrCode) {
                setQrCode(result.qrCode);
                setStage("qr");
            } else {
                throw new Error("Não foi possível gerar o código PIX no PagSeguro.");
            }
        } catch (e: any) {
            setErrMsg(e.message || "Erro desconhecido ao gerar pagamento.");
            setStage("error");
        }
    }

    if (stage === "paid") {
        return (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Pagamento Confirmado!</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs">
                    Seu PIX foi aprovado com sucesso via PagSeguro.
                </p>
                <a
                    href={`/orders/${orderId}`}
                    className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors"
                >
                    Ver Pedido
                </a>
            </div>
        );
    }

    if (stage === "qr") {
        return (
            <div className="flex flex-col items-center gap-6">
                <div className="text-center space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-full mb-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            Aguardando PIX no PagBank
                        </span>
                    </div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white">Escaneie o QR Code</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Abra o aplicativo e escaneie a imagem abaixo</p>
                </div>

                <div className="relative p-4 bg-white rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700">
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode)}`}
                        alt="QR Code PIX PagSeguro"
                        className="rounded-lg w-[220px] h-[220px]"
                    />
                </div>

                <div className="text-center">
                    <p className="text-xs text-zinc-400 mb-1">Valor a pagar</p>
                    <p className="text-3xl font-black text-zinc-900 dark:text-white">{fmt(total)}</p>
                </div>

                <div className="w-full max-w-md space-y-2">
                    <p className="text-xs text-zinc-400 text-center">ou copie o código Copia e Cola:</p>
                    <div className="flex gap-2">
                        <input
                            readOnly
                            value={qrCode}
                            className="flex-1 px-3 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-500 dark:text-zinc-400 font-mono"
                        />
                        <button
                            onClick={handleCopy}
                            className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${copied
                                ? "bg-emerald-500 text-white"
                                : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90"
                                }`}
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? "Copiado!" : "Copiar"}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <RefreshCw size={12} className={pollCount > 0 ? "animate-spin" : ""} />
                    Verificando status do pagamento… <span className="font-mono">({pollCount})</span>
                </div>

                {process.env.NODE_ENV === "development" && (
                    <button
                        onClick={handleMockPayment}
                        disabled={mocking}
                        className="mt-6 flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-lg border border-yellow-300 hover:bg-yellow-200"
                    >
                        <Bug size={14} /> {mocking ? "Simulando..." : "Simular PIX Pago (Dev Only)"}
                    </button>
                )}
            </div>
        );
    }

    if (stage === "error") {
        return (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertCircle size={28} className="text-red-500" />
                </div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Erro ao gerar PIX</h2>
                <p className="text-sm text-red-500 max-w-xs">{errMsg}</p>
                <button
                    onClick={() => setStage("idle")}
                    className="mt-2 flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                    <RefreshCw size={16} /> Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-6 py-4">
            <div className="text-center space-y-2">
                <h2 className="text-xl font-black text-zinc-900 dark:text-white">Pagamento PagBank</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
                    Confirme os dados e gere o seu código PIX seguro.
                </p>
            </div>

            <div className="w-full max-w-sm grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center gap-1.5 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-emerald-500">
                    <Zap size={18} className="text-emerald-500" />
                    <span className="text-[11px] text-emerald-600 font-bold text-center">PIX PagSeguro</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-100 dark:border-zinc-800 opacity-50 cursor-not-allowed">
                    <span className="text-[11px] text-zinc-500 font-medium text-center mt-2">Cartão de Crédito<br />(Logo Mais)</span>
                </div>
            </div>

            <div className="text-center py-3 px-8 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-100 dark:border-zinc-800 w-full max-w-sm">
                <p className="text-xs text-zinc-400 mb-1">Total a pagar</p>
                <p className="text-4xl font-black text-zinc-900 dark:text-white">{fmt(total)}</p>
            </div>

            <button
                onClick={handleGerarPix}
                disabled={stage === "loading"}
                className="w-full max-w-sm flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
            >
                {stage === "loading" ? <Loader2 size={22} className="animate-spin" /> : <QrCode size={22} />}
                Gerar Código PIX
            </button>
            <p className="text-[11px] text-zinc-400 text-center mt-1">
                Processamento seguro em Sandbox por <strong>PagSeguro</strong>
            </p>
        </div>
    );
}
