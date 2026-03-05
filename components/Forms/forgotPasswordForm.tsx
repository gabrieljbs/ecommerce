"use client";

import { useActionState, useState } from "react";
import { forgotPassword } from "@/action/forgot-password";
import { Loader2, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

const initialState: { success: boolean; message?: string; error?: string } = {
    success: false,
};

export default function ForgotPasswordForm() {
    const [state, action, isPending] = useActionState(forgotPassword, initialState);
    const [sent, setSent] = useState(false);

    if (state?.success && !sent) {
        setSent(true);
    }

    if (sent) {
        return (
            <div className="w-full text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-primary-50 dark:bg-primary-900/40 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Verifique seu E-mail</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {state?.message || "Se este e-mail for válido, enviaremos um link de recuperação pra ele em instantes."}
                    </p>
                </div>
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-500 hover:underline"
                >
                    <ArrowLeft size={16} />
                    Voltar para o Login
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Recuperar senha
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Digite o endereço de e-mail associado à sua conta.
                </p>
            </div>

            <form action={action} className="space-y-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <Mail size={18} />
                    </div>
                    <input
                        type="email"
                        name="email"
                        required
                        placeholder="seu@email.com"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 dark:text-white"
                    />
                </div>

                {state?.error && (
                    <div className="p-4 text-sm font-medium text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl flex items-center gap-2">
                        <span className="block w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                        {state.error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                    {isPending ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Enviando instrução...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span>Enviar link de acesso</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    )}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                Lembrou a senha?{" "}
                <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors hover:underline decoration-2 underline-offset-4">
                    Voltar ao Login
                </Link>
            </p>
        </div>
    );
}
