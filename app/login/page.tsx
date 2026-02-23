import LoginForm from "@/components/Forms/loginForm";
import Image from "next/image";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
    const { callbackUrl } = await searchParams;
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950">
            {/* Lado Esquerdo: Formulário */}
            <div className="flex w-full flex-col justify-center items-center p-8 lg:w-1/2">
                <div className="w-full max-w-sm">
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
                <Image
                    src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=2070&auto=format&fit=crop"
                    alt="Coleção de Moda"
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="relative z-10 p-12 text-white max-w-lg">
                    <h2 className="text-4xl font-bold mb-6">Redefina seu estilo.</h2>
                    <p className="text-lg text-zinc-200 mb-8">
                        As melhores marcas e produtos exclusivos esperando por você. Faça login e aproveite ofertas personalizadas.
                    </p>
                    <div className="flex gap-4 items-center">
                        <div className="w-12 h-1 bg-white/30 rounded-full overflow-hidden">
                            <div className="w-2/3 h-full bg-white"></div>
                        </div>
                        <p className="text-sm font-medium text-zinc-300">Nova coleção disponível</p>
                    </div>
                </div>
            </div>
        </div>
    );
}