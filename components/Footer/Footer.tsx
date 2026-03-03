import Link from "next/link";
import { Facebook, Instagram, Twitter, ShoppingBag, ArrowRight } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* Brand Info */}
                    <div className="space-y-4 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-600/20">
                                <ShoppingBag size={20} className="fill-current" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Store.</span>
                        </Link>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-xs">
                            Sua loja de confiança com as melhores tendências de estilo, entregues com rapidez e segurança na sua porta.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 hover:border-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 hover:border-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 hover:border-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                <Twitter size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="font-bold text-zinc-900 dark:text-white mb-6">Navegação</h4>
                        <ul className="space-y-3">
                            <li><Link href="/" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Página Inicial</Link></li>
                            <li><Link href="/product" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Cátalogo Completo</Link></li>
                            <li><Link href="#" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Novidades e Tendências</Link></li>
                            <li><Link href="#" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Ofertas em Destaque</Link></li>
                        </ul>
                    </div>

                    {/* Help & Support */}
                    <div>
                        <h4 className="font-bold text-zinc-900 dark:text-white mb-6">Suporte ao Cliente</h4>
                        <ul className="space-y-3">
                            <li><Link href="/profile" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Minha Conta</Link></li>
                            <li><Link href="/profile" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Acompanhar Pedido</Link></li>
                            <li><Link href="#" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Políticas de Devolução</Link></li>
                            <li><Link href="#" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Central de Ajuda (FAQ)</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="lg:col-span-1">
                        <h4 className="font-bold text-zinc-900 dark:text-white mb-6">Novidades Exclusivas</h4>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                            Cadastre seu e-mail e receba acesso antecipado a promoções e lançamentos.
                        </p>
                        <form className="relative flex items-center">
                            <input
                                type="email"
                                placeholder="Seu melhor e-mail"
                                className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-full py-3 px-5 text-sm outline-none focus:ring-2 focus:ring-indigo-600 dark:text-white"
                            />
                            <button
                                type="submit"
                                className="absolute right-1 w-10 h-10 bg-indigo-600 rounded-full text-white flex items-center justify-center hover:bg-indigo-700 transition-colors focus:outline-none"
                            >
                                <ArrowRight size={18} />
                            </button>
                        </form>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500">
                        &copy; {new Date().getFullYear()} Store. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-4">
                        <Link href="#" className="text-xs text-zinc-500 hover:text-indigo-600 transition-colors">Termos de Uso</Link>
                        <Link href="#" className="text-xs text-zinc-500 hover:text-indigo-600 transition-colors">Política de Privacidade</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
