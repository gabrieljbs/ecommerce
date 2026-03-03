import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MapPin, Plus } from "lucide-react";
import Link from "next/link";

export default async function ProfileAddressesPage() {

    const user = await auth();

    if (!user) {
        redirect("/login");
    }

    // In a full implementation we would have an "addresses" table linked to "users".
    // Since the database schema provided does not have an addresses table, we will display a placeholder 
    // indicating the feature is in development or prompt them to use checkout for address entry.

    const addresses: any[] = [];

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Meus Endereços</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Gerencie seus endereços de entrega.</p>
                    </div>
                </div>

                <Link
                    href="#"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-sm font-semibold rounded-lg transition-colors cursor-not-allowed opacity-50"
                    title="Em breve"
                >
                    <Plus size={16} />
                    Novo Endereço
                </Link>
            </div>

            {addresses.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                    <MapPin size={48} className="mx-auto text-zinc-400 mb-4 opacity-50" />
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Nenhum endereço salvo</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
                        Você ainda não possui endereços salvos. Seus endereços serão salvos automaticamente durante o fechamento da sua próxima compra.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Placeholder for future implementation when DB table is created */}
                </div>
            )}
        </div>
    );
}
