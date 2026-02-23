"use client";

import { useState, useEffect, useCallback } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { processPayment, checkPaymentStatus } from "@/action/payment";
import {
    QrCode,
    Copy,
    Check,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Loader2,
    CreditCard,
    Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PixPaymentProps {
    orderId: string;
    total: number;       // em centavos
    orderStatus: string;
    payerEmail?: string; // prefill do email no brick
}

type Stage = "idle" | "loading" | "brick" | "qr" | "waiting" | "paid" | "error";

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: "pt-BR" });

export default function PixPayment({ orderId, total, orderStatus, payerEmail }: PixPaymentProps) {
    const router = useRouter();

    const [stage, setStage] = useState<Stage>(orderStatus === "paid" ? "paid" : "idle");
    const [qrCode, setQrCode] = useState("");
    const [qrBase64, setQrBase64] = useState("");
    const [copied, setCopied] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const [pollCount, setPollCount] = useState(0);

    function fmt(cents: number) {
        return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    async function handleCopy() {
        await navigator.clipboard.writeText(qrCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    }

    // ── Polling de status ─────────────────────────────────────────────────────
    const poll = useCallback(async () => {
        try {
            const res = await checkPaymentStatus(orderId);
            setPollCount(c => c + 1);
            if (res.paid) {
                setStage("paid");
                router.refresh();
            }
        } catch { /* silencia */ }
    }, [orderId, router]);

    useEffect(() => {
        if (stage !== "qr" && stage !== "waiting") return;
        const interval = setInterval(poll, 5000);
        return () => clearInterval(interval);
    }, [stage, poll]);

    // ══════════════════════════════════════════════════════════════════════════
    // PAID
    // ══════════════════════════════════════════════════════════════════════════
    if (stage === "paid") {
        return (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Pagamento Confirmado!</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs">
                    Seu pedido foi pago com sucesso.
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

    // ══════════════════════════════════════════════════════════════════════════
    // WAITING — cartão enviado mas ainda não aprovado (in_process / pending)
    // ══════════════════════════════════════════════════════════════════════════
    if (stage === "waiting") {
        return (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                    <Loader2 size={40} className="text-amber-500 animate-spin" />
                </div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Aguardando Confirmação</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs">
                    Seu pagamento está sendo processado. Você será notificado assim que confirmado.
                </p>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <RefreshCw size={12} className="animate-spin" />
                    Verificando automaticamente… <span className="font-mono">({pollCount})</span>
                </div>
            </div>
        );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // QR CODE
    // ══════════════════════════════════════════════════════════════════════════
    if (stage === "qr") {
        return (
            <div className="flex flex-col items-center gap-6">
                <div className="text-center space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-full mb-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            Aguardando pagamento
                        </span>
                    </div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white">Escaneie o QR Code PIX</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Abra o app do seu banco e escaneie</p>
                </div>

                <div className="relative p-4 bg-white rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700">
                    {qrBase64 ? (
                        <Image
                            src={`data:image/png;base64,${qrBase64}`}
                            alt="QR Code PIX"
                            width={220}
                            height={220}
                            className="rounded-lg"
                            unoptimized
                        />
                    ) : (
                        <div className="w-52 h-52 flex items-center justify-center bg-zinc-50 rounded-lg">
                            <QrCode size={80} className="text-zinc-300" />
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <p className="text-xs text-zinc-400 mb-1">Valor a pagar</p>
                    <p className="text-3xl font-black text-zinc-900 dark:text-white">{fmt(total)}</p>
                </div>

                <div className="w-full max-w-md space-y-2">
                    <p className="text-xs text-zinc-400 text-center">ou use o código copia e cola</p>
                    <div className="flex gap-2">
                        <input
                            readOnly
                            value={qrCode}
                            className="flex-1 px-3 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-500 dark:text-zinc-400 truncate font-mono"
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
                    <RefreshCw size={12} className="animate-spin" />
                    Verificando automaticamente… <span className="font-mono">({pollCount})</span>
                </div>
                <p className="text-[11px] text-zinc-400 text-center max-w-xs">
                    O QR Code expira em <strong>30 minutos</strong>. Confirmação é automática.
                </p>
            </div>
        );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ERROR
    // ══════════════════════════════════════════════════════════════════════════
    if (stage === "error") {
        return (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertCircle size={28} className="text-red-500" />
                </div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Erro ao gerar pagamento</h2>
                <p className="text-sm text-red-500 max-w-xs">{errMsg}</p>
                <button
                    onClick={() => setStage("brick")}
                    className="mt-2 flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                    <RefreshCw size={16} /> Tentar novamente
                </button>
            </div>
        );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // IDLE — tela inicial antes de mostrar o brick
    // ══════════════════════════════════════════════════════════════════════════
    if (stage === "idle") {
        return (
            <div className="flex flex-col items-center gap-6 py-4">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full bg-emerald-100 dark:bg-emerald-900/30 animate-pulse" />
                    <div className="relative w-full h-full rounded-full bg-emerald-50 dark:bg-emerald-900/50 border-2 border-emerald-200 dark:border-emerald-700 flex items-center justify-center">
                        <CreditCard size={40} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white">Escolha a forma de pagamento</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
                        Pague com PIX, cartão de crédito ou débito de forma segura.
                    </p>
                </div>

                <div className="w-full max-w-sm grid grid-cols-3 gap-3">
                    {[
                        { icon: Zap, label: "Instantâneo" },
                        { icon: Check, label: "Sem taxas" },
                        { icon: QrCode, label: "Fácil de usar" },
                    ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <Icon size={18} className="text-emerald-500" />
                            <span className="text-[11px] text-zinc-500 font-medium text-center">{label}</span>
                        </div>
                    ))}
                </div>

                <div className="text-center py-3 px-8 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-100 dark:border-zinc-800 w-full max-w-sm">
                    <p className="text-xs text-zinc-400 mb-1">Total a pagar</p>
                    <p className="text-4xl font-black text-zinc-900 dark:text-white">{fmt(total)}</p>
                </div>

                <button
                    onClick={() => setStage("brick")}
                    className="w-full max-w-sm flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95"
                >
                    <CreditCard size={22} />
                    Ir para o pagamento
                </button>

                <p className="text-[11px] text-zinc-400 text-center">
                    Processado por <strong>Mercado Pago</strong> · Dados protegidos com criptografia
                </p>
            </div>
        );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // BRICK — Payment Brick do MP (sem preferenceId = Checkout Bricks)
    // ══════════════════════════════════════════════════════════════════════════
    return (
        <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-full w-fit mb-1">
                <CreditCard size={13} className="text-zinc-500" />
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Selecione o método de pagamento
                </span>
            </div>

            {stage === "loading" && (
                <div className="flex items-center gap-2 text-sm text-zinc-500 py-4">
                    <Loader2 size={16} className="animate-spin" />
                    Processando pagamento...
                </div>
            )}

            <Payment
                initialization={{
                    amount: total / 100,
                    payer: {
                        email: payerEmail ?? "",  // prefill do email no brick (importante para testes)
                    },
                }}
                customization={{
                    paymentMethods: {
                        bankTransfer: "all",   // PIX
                        creditCard: "all",
                        debitCard: "all",
                    },
                    visual: {
                        style: { theme: "default" },
                    },
                }}
                onSubmit={async ({ formData }) => {
                    setStage("loading");
                    try {
                        // Passa o formData completo do brick para o backend
                        const result = await processPayment(
                            orderId,
                            formData as unknown as Record<string, unknown>
                        );

                        if (formData.payment_method_id === "pix") {
                            // PIX: exibe QR code
                            if (!result.qrCode) throw new Error("QR Code não retornado pelo Mercado Pago.");
                            setQrCode(result.qrCode);
                            setQrBase64(result.qrCodeBase64 ?? "");
                            setStage("qr");
                        } else {
                            // Cartão: verifica aprovação
                            if (result.status === "approved") {
                                setStage("paid");
                            } else {
                                // Pendente / em análise — aguarda webhook ou polling
                                setStage("waiting");
                            }
                        }
                    } catch (e: unknown) {
                        const msg = e instanceof Error ? e.message : "Erro ao processar pagamento.";
                        setErrMsg(msg);
                        setStage("error");
                    }
                }}
                onReady={() => console.log("[MP Brick] Pronto")}
                onError={(error) => {
                    console.error("[MP Brick Error]", error);
                    setErrMsg("Erro no formulário de pagamento. Tente recarregar.");
                    setStage("error");
                }}
            />

            <p className="text-[11px] text-zinc-400 text-center mt-1">
                Processado por <strong>Mercado Pago</strong> · Dados protegidos com criptografia
            </p>
        </div>
    );
}
