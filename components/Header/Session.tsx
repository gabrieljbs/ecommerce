"use client"
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { logout } from "@/action/logout";



export default function Session({ user }: { user: any }) {

    if (user) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                    <User size={18} />
                    <span>{user.name}</span>
                </div>
                <button
                    onClick={() => logout()}
                    className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors"
                    title="Sair"
                >
                    <LogOut size={18} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/login" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
                Entrar
            </Link>
            <Link
                href="/register"
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
                Criar conta
            </Link>
        </div>
    );
}