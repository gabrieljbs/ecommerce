"use client"
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { logout } from "@/action/logout";



export default function Session({ user }: { user: any }) {

    if (user) {
        return (
            <div className="flex items-center gap-1 md:gap-3 bg-zinc-50 p-1 md:pr-2 rounded-full border border-zinc-200">
                <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-zinc-700 pl-2 hover:text-primary-600 transition-colors">
                    <User size={16} className="text-primary-600" />
                    <span className="max-w-[100px] md:max-w-[150px] truncate" title={user.name}>
                        {user.name?.split(' ')[0]}
                    </span>
                </Link>
                <button
                    onClick={() => logout()}
                    className="p-1.5 md:p-2 text-zinc-400 hover:text-red-500 hover:bg-white rounded-full transition-all shadow-sm border border-transparent hover:border-red-100"
                    title="Sair"
                >
                    <LogOut size={16} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 text-sm font-medium">
            <Link href="/login" className="text-zinc-600 hover:text-primary-600 transition-colors hidden md:block">
                Entrar
            </Link>
            <Link
                href="/register"
                className="px-5 py-2.5 bg-zinc-900 text-white rounded-full hover:bg-primary-600 shadow-md transition-all font-semibold"
            >
                Criar conta
            </Link>
        </div>
    );
}