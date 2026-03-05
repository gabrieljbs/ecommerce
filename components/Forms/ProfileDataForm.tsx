"use client";

import { User, ShieldCheck } from "lucide-react";
import { updateProfileData } from "@/action/profile";
import { useActionState, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfileDataForm({ user }: { user: { id: string, name: string, email: string } }) {

    const [message, action, isPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            const result = await updateProfileData(formData);
            return result;
        },
        null
    );

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8">

            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-800/50">
                <div className="md:hidden">
                    <Link href="/profile" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500">
                        <ArrowLeft size={20} />
                    </Link>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <User size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Meus Dados</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Mantenha suas informações pessoais atualizadas.</p>
                </div>
            </div>

            {message?.error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium border border-red-200 dark:border-red-900/50">
                    {message.error}
                </div>
            )}

            {message?.success && (
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-medium border border-emerald-200 dark:border-emerald-900/50">
                    {message.success}
                </div>
            )}

            <div className="max-w-xl">
                <form action={action} className="space-y-6">

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-300 uppercase tracking-wider mb-2">
                            Informações Pessoais
                        </h3>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Nome Completo
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                defaultValue={user.name}
                                required
                                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-600"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                E-mail de Acesso
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    defaultValue={user.email}
                                    readOnly
                                    className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 rounded-lg cursor-not-allowed"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 flex items-center gap-1 text-xs font-semibold">
                                    <ShieldCheck size={14} />
                                    <span>Verificado</span>
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">O e-mail não pode ser alterado diretamente por questões de segurança.</p>
                        </div>
                    </div>

                    <hr className="border-zinc-100 dark:border-zinc-800/50" />

                    {/* Password Update */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-300 uppercase tracking-wider mb-2">
                            Alterar Senha
                        </h3>
                        <p className="text-xs text-zinc-500 mb-4">
                            Deixe os campos em branco se não desejar alterar sua senha atual.
                        </p>

                        <div>
                            <label htmlFor="current_password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Senha Atual
                            </label>
                            <input
                                type="password"
                                name="current_password"
                                id="current_password"
                                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-600"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="new_password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Nova Senha
                                </label>
                                <input
                                    type="password"
                                    name="new_password"
                                    id="new_password"
                                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-600"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirm_password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Confirmar Nova Senha
                                </label>
                                <input
                                    type="password"
                                    name="confirm_password"
                                    id="confirm_password"
                                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-600"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
