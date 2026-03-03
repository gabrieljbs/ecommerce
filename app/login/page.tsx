import LoginForm from "@/components/Forms/loginForm";
import Image from "next/image";
import { MailCheck, ShieldCheck } from "lucide-react";
import { getActiveBannerByPosition } from "@/db/queries/banners";
import Link from "next/link";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string, check_email?: string, verified?: string }> }) {
    const { callbackUrl, check_email, verified } = await searchParams;
    const banner = await getActiveBannerByPosition("login_side");

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950">
            {/* Lado Esquerdo: Formulário */}
            <div className="flex w-full flex-col justify-center items-center p-8 lg:w-1/2">
                <div className="w-full max-w-sm">

                    {/* TOASTS DE EMAIL */}
                    {check_email === "true" && (
                        <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
                            <MailCheck className="text-orange-500 shrink-0 mt-0.5" size={24} />
                            <div>
                                <h3 className="text-sm font-bold text-orange-800">Verifique seu e-mail!</h3>
                                <p className="text-sm text-orange-700 mt-1">
                                    Enviamos um link de ativação para sua caixa de entrada. Clique nele para liberar seu acesso à loja.
                                </p>
                            </div>
                        </div>
                    )}

                    {verified === "true" && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
                            <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={24} />
                            <div>
                                <h3 className="text-sm font-bold text-emerald-800">Conta Ativada!</h3>
                                <p className="text-sm text-emerald-700 mt-1">
                                    Seu e-mail foi verificado com sucesso. Você já pode fazer login e aproveitar as ofertas.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="w-full">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                Bem-vindo de volta
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Acesse sua conta para ver seus pedidos e favoritos.
                            </p>
                        </div>
                        <LoginForm callbackUrl={callbackUrl} />
                    </div>
                </div>
            </div>

            {/* Lado Direito: Imagem/Oferta (Escondido em mobile) */}
            <div className="hidden lg:flex w-1/2 relative bg-zinc-900 justify-center items-center overflow-hidden">
                {banner?.linkUrl ? (
                    <Link href={banner.linkUrl} className="absolute inset-0 z-0">
                        <Image
                            src={banner.imageUrl}
                            alt={banner.title}
                            fill
                            className="object-cover opacity-60 hover:opacity-80 transition-opacity"
                            priority
                        />
                    </Link>
                ) : (
                    <Image
                        src={banner?.imageUrl || "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=2070&auto=format&fit=crop"}
                        alt={banner ? banner.title : "Coleção de Moda"}
                        fill
                        className="object-cover opacity-60"
                        priority
                    />
                )}

                <div className="relative z-10 p-12 text-white max-w-lg pointer-events-none">
                    <h2 className="text-4xl font-bold mb-6">{banner ? banner.title : "Redefina seu estilo."}</h2>
                    <p className="text-lg text-zinc-200 mb-8">
                        {banner ? "" : "As melhores marcas e produtos exclusivos esperando por você. Faça login e aproveite ofertas personalizadas."}
                    </p>
                    <div className="flex gap-4 items-center">
                        <div className="w-12 h-1 bg-white/30 rounded-full overflow-hidden">
                            <div className="w-2/3 h-full bg-white"></div>
                        </div>
                        <p className="text-sm font-medium text-zinc-300 pointer-events-auto">
                            {banner?.linkUrl ? "Clique para conferir" : "Nova coleção disponível"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}