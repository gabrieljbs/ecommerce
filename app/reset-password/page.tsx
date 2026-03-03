import ResetPasswordForm from "@/components/Forms/resetPasswordForm";
import Image from "next/image";

export default async function ResetPasswordPage({
    searchParams
}: {
    searchParams: Promise<{ token?: string }>
}) {
    // Note: Em Next.js App Router (turbopack), searchParams de uma page asyncrona precisa aguardar, e extrair o string
    const awaitedParams = await searchParams;
    const token = awaitedParams.token || "";

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950">
            {/* Lado Esquerdo: Formulário */}
            <div className="flex w-full flex-col justify-center items-center p-8 lg:w-1/2">
                <div className="w-full max-w-sm">
                    <ResetPasswordForm token={token} />
                </div>
            </div>

            {/* Lado Direito: Imagem/Oferta (Escondido em mobile) */}
            <div className="hidden lg:flex w-1/2 relative bg-zinc-900 justify-center items-center overflow-hidden">
                <Image
                    src="https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=2070&auto=format&fit=crop"
                    alt="Segurança da Conta"
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="relative z-10 p-12 text-white max-w-lg">
                    <h2 className="text-4xl font-bold mb-6">Proteção garantida.</h2>
                    <p className="text-lg text-zinc-200 mb-8">
                        Nunca compartilhe essa senha. Lembre-se de usar palavras seguras e evitar datas de nascimento.
                    </p>
                    <div className="flex gap-4 items-center">
                        <div className="w-12 h-1 bg-white/30 rounded-full overflow-hidden">
                            <div className="w-full h-full bg-white"></div>
                        </div>
                        <p className="text-sm font-medium text-zinc-300">Quase pronto</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
