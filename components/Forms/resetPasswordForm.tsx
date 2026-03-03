"use client";

import { useActionState, useState } from "react";
import { resetPassword } from "@/action/reset-password";
import { Loader2, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const initialState: { success: boolean; message?: string; error?: string } = {
    success: false,
};

export default function ResetPasswordForm({ token }: { token: string }) {
    const [state, action, isPending] = useActionState(resetPassword, initialState);
    const [isEyeOpen, setIsEyeOpen] = useState(false);

    if (!token) {
        return (
            <div className="w-full text-center p-8 bg-red-50 border border-red-100 rounded-xl">
                <h3 className="text-red-800 font-bold mb-2">Token Ausente</h3>
                <p className="text-red-600 text-sm">Nenhum código de segurança foi recebido no link. Acesse o E-mail de redefinição e tente clicar novamente nele ou solicite um novo.</p>
                <Link href="/forgot-password" className="mt-4 inline-block text-blue-600 hover:underline font-bold text-sm">Voltar e Solicitar Novo Link</Link>
            </div>
        );
    }

    if (state?.success) {
        return (
            <div className="w-full text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-emerald-50 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Senha Redefinida!</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {state?.message || "Sua senha foi redefinida com extremo sucesso! Sua conta já está segura."}
                    </p>
                </div>
                <Link
                    href="/login"
                    className="inline-flex justify-center w-full py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
                >
                    Entrar com Nova Senha
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Alterar Senha
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Crie uma nova senha forte com no mínimo 6 caracteres.
                </p>
            </div>

            <form action={action} className="space-y-6">
                <input type="hidden" name="token" value={token} />

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <Lock size={18} />
                    </div>
                    <input
                        type={isEyeOpen ? "text" : "password"}
                        name="password"
                        required
                        minLength={6}
                        placeholder="Nova senha secreta"
                        className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 dark:text-white"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">
                        <button type="button" onClick={() => setIsEyeOpen(!isEyeOpen)} tabIndex={-1} className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                            {isEyeOpen ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                    </div>
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
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                >
                    {isPending ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Salvando...</span>
                        </div>
                    ) : (
                        <span>Redefinir Senha Definitiva</span>
                    )}
                </button>
            </form>
        </div>
    );
}
