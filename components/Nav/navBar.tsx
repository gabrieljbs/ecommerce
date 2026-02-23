import Link from "next/link";

export default function NavBar() {
    return (
        <nav className="hidden md:block">
            <ul className="flex flex-row gap-6">
                <li><Link href="/product" className="text-sm font-medium hover:text-emerald-600 transition-colors">Produtos</Link></li>
                <li><Link href="/orders" className="text-sm font-medium hover:text-emerald-600 transition-colors">Meus Pedidos</Link></li>
            </ul>
        </nav>
    );
}