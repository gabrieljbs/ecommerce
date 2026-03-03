

import RegisterForm from "@/components/Forms/registerForm";
import Image from "next/image";
import { getActiveBannerByPosition } from "@/db/queries/banners";
import Link from "next/link";

export default async function RegisterPage() {
    const banner = await getActiveBannerByPosition("register_side");

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950">
            {/* Lado Esquerdo: Formulário */}
            <div className="flex w-full flex-col justify-center items-center p-8 lg:w-1/2">
                <div className="w-full max-w-sm">
                    <RegisterForm />
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
                        src={banner?.imageUrl || "https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=2070&auto=format&fit=crop"}
                        alt={banner ? banner.title : "Oferta Especial"}
                        fill
                        className="object-cover opacity-60"
                        priority
                    />
                )}

                <div className="relative z-10 p-12 text-white max-w-lg pointer-events-none">
                    <h2 className="text-4xl font-bold mb-6">{banner ? banner.title : "Comece sua jornada hoje."}</h2>
                    <p className="text-lg text-zinc-200 mb-8">
                        {banner ? "" : "Junte-se a milhões de usuários e aproveite as melhores ofertas exclusivas para membros."}
                    </p>
                    <div className="flex gap-4">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-700 flex items-center justify-center overflow-hidden">
                                    <span className="text-xs">User</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm self-center text-zinc-300 pointer-events-auto">
                            {banner?.linkUrl ? "Clique para mais detalhes" : "+ de 10k usuários"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}