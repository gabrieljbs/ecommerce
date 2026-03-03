"use client";

import { useActionState, useState } from "react";
import { register } from "@/action/register";
import Link from "next/link";
import { Loader2, Mail, Lock, User, ArrowRight, Github, Eye, EyeOff } from "lucide-react";
import { redirect } from "next/navigation";

const initialState = {
    success: false,
    error: "",
    attempts: 0,
};

export default function RegisterForm() {
    const [state, action, isPending] = useActionState(register, initialState);
    const [isEyeOpen, setIsEyeOpen] = useState(false);


    if (state?.success) {
        return redirect("/login?check_email=true");
    }

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Crie sua conta
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Preencha seus dados abaixo para começar.
                </p>
            </div>

            <form action={action} className="space-y-5">
                <div className="space-y-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            <User size={18} />
                        </div>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="Nome completo"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 dark:text-white"
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="seu@email.com"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 dark:text-white"
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            <Lock size={18} />
                        </div>
                        <input
                            type={isEyeOpen ? "text" : "password"}
                            name="password"
                            required
                            placeholder="Sua senha secreta"
                            minLength={6}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 dark:text-white"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">
                            <button type="button" onClick={() => setIsEyeOpen(!isEyeOpen)}>
                                {isEyeOpen ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                {state?.error && (
                    <div className="p-4 text-sm font-medium text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl flex items-center gap-2">
                        <span className="block w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                        {state.error}
                    </div>
                )}

                {state?.success && (
                    <div className="p-4 text-sm font-medium text-green-500 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded-xl flex items-center gap-2">
                        <span className="block w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></span>
                        Conta criada com sucesso!
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                    {isPending ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Processando...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span>Criar conta</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    )}
                </button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-zinc-800"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-zinc-950 text-gray-500">Ou continue com</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button type="button" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Github size={18} />
                        Github
                    </button>
                    <button type="button" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.539H24c0.124,0.707,0.188,1.438,0.188,2.169c0,6.075-4.148,10.605-9.664,10.605 c-5.875,0-10.835-4.48-11.233-10.158C3.268,12.56,3.268,11.44,3.289,10.842C3.687,5.165,8.647,0.685,14.524,0.685 c3.037,0,5.922,1.071,8.146,3.007l-3.238,3.238C17.765,5.432,16.195,4.717,14.524,4.717c-3.771,0-6.938,2.693-7.795,6.315 C6.712,11.127,6.712,11.232,6.711,11.338c0.826,4.045,4.351,7.025,8.514,7.025c2.259,0,4.282-0.565,5.836-1.571 c1.407-0.912,2.448-2.31,2.839-3.953h-5.266V10.539z" /></svg>
                        Google
                    </button>
                </div>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                Já possui uma conta?{" "}
                <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors hover:underline decoration-2 underline-offset-4">
                    Entrar agora
                </Link>
            </p>
        </div>
    );
}