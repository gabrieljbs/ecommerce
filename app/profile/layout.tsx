import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { User, Package, MapPin, LogOut } from "lucide-react";
import { ReactNode } from "react";

export default async function ProfileLayout({ children }: { children: ReactNode }) {

    // Server Side Protection
    const user = await auth();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen pb-12">

            <div className="bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 pt-8 pb-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Minha Conta</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                        Gerencie seus pedidos, dados pessoais e endereços.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Navigation Sidebar */}
                    <aside className="w-full md:w-64 shrink-0">
                        <nav className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden sticky top-24">
                            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                <li>
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-3 px-6 py-4 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        <Package size={20} />
                                        <span className="font-medium">Meus Pedidos</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/profile/dados"
                                        className="flex items-center gap-3 px-6 py-4 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        <User size={20} />
                                        <span className="font-medium">Meus Dados</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/profile/enderecos"
                                        className="flex items-center gap-3 px-6 py-4 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        <MapPin size={20} />
                                        <span className="font-medium">Endereços</span>
                                    </Link>
                                </li>

                                {/* Logout Action */}
                                <li>
                                    <form action="/action/logout" method="POST">
                                        <button
                                            type="submit"
                                            className="w-full flex items-center gap-3 px-6 py-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                                        >
                                            <LogOut size={20} />
                                            <span className="font-medium">Sair da Conta</span>
                                        </button>
                                    </form>
                                </li>
                            </ul>
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1">
                        {children}
                    </main>

                </div>
            </div>
        </div>
    );
}
