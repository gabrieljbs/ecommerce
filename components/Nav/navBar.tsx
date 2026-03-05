import Link from "next/link";

export default function NavBar() {
    return (
        <nav className="hidden md:block">
            <ul className="flex flex-row gap-1 bg-zinc-100/50 dark:bg-zinc-900/50 p-1 rounded-full border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md">
                <li>
                    <Link href="/product" className="px-5 py-2 block text-sm font-semibold rounded-full text-zinc-600 hover:text-primary-700 hover:bg-white dark:text-zinc-300 dark:hover:text-primary-400 dark:hover:bg-zinc-800 transition-all shadow-sm hover:shadow-md">
                        Looks
                    </Link>
                </li>
                <li>
                    <Link href="/orders" className="px-5 py-2 block text-sm font-semibold rounded-full text-zinc-600 hover:text-primary-700 hover:bg-white dark:text-zinc-300 dark:hover:text-primary-400 dark:hover:bg-zinc-800 transition-all shadow-sm hover:shadow-md">
                        Meus Pedidos
                    </Link>
                </li>
            </ul>
        </nav>
    );
}