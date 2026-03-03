import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.json({ error: "Token não foi enviado no link." }, { status: 400 });
    }

    try {
        // Encontra o usuário pelo token e confere a data de validade
        const userWithToken = await db.query.users.findFirst({
            where: eq(users.emailVerificationToken, token)
        });

        if (!userWithToken) {
            return NextResponse.json({ error: "Link de verificação inválido ou adulterado." }, { status: 400 });
        }

        // Verifica se o token expirou (Passou de 2 horas)
        if (userWithToken.emailVerificationExpires && new Date() > userWithToken.emailVerificationExpires) {
            return NextResponse.json({ error: "Este link expirou. Por favor, solicite um novo na tela de login." }, { status: 400 });
        }

        // Sucesso: Marca a conta como Ativa e destrói o token para não ser reutilizado
        await db.update(users)
            .set({
                emailVerified: true,
                emailVerificationToken: null,
                emailVerificationExpires: null
            })
            .where(eq(users.id, userWithToken.id));

        // Redireciona o cliente para a tela de Login com aviso Verde!
        return NextResponse.redirect(new URL("/login?verified=true", request.url));

    } catch (error) {
        console.error("Erro na rota de verificação:", error);
        return NextResponse.json({ error: "Erro interno do servidor ao validar token." }, { status: 500 });
    }
}
