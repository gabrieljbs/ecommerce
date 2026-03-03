"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function resetPassword(prevState: any, formData: FormData): Promise<{ success: boolean; error?: string; message?: string }> {
    const cookieStore = await cookies();
    const attemptsCookie = cookieStore.get("reset_attempts");
    const currentAttempts = attemptsCookie ? parseInt(attemptsCookie.value) : 0;

    // Antispam básico
    if (currentAttempts >= 5) {
        return {
            success: false,
            error: "Muitas tentativas falhas. Tente novamente mais tarde.",
        };
    }

    const token = formData.get("token") as string;
    const password = formData.get("password") as string;

    if (!token || !password || password.length < 6) {
        return { success: false, error: "A nova senha precisa ter no mínimo 6 caracteres." };
    }

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.passwordResetToken, token)
        });

        if (!user || user.passwordResetToken !== token) {
            return {
                success: false,
                error: "Este link de redefinição é inválido ou já foi usado.",
            };
        }

        // Verifica validade
        if (user.passwordResetExpires && new Date() > user.passwordResetExpires) {
            return {
                success: false,
                error: "Este link de segurança expirou. Por favor, solicite a troca novamente.",
            };
        }

        // Criptografa Nova Senha
        const hashedPassword = await bcrypt.hash(password, 12);

        // Atualiza a Senha do Usuário e LIMPA o Token e Validade pra ele não poder ser reutilizado nunca mais
        await db.update(users)
            .set({
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null,
                emailVerified: true // Se ele alterou a senha porque não lembrava via E-mail dele, damos o E-mail como Verificado de bônus!
            })
            .where(eq(users.id, user.id));

        // Limpar tentativas
        cookieStore.delete("reset_attempts");

        return {
            success: true,
            message: "Sua senha foi redefinida com sucesso!"
        };

    } catch (error) {
        console.error("ERRO NO RESET PASSWORD:", error);

        cookieStore.set("reset_attempts", (currentAttempts + 1).toString(), {
            httpOnly: true,
            maxAge: 30 * 60, // 30 mins
        });

        return {
            success: false,
            error: "Ocorreu um erro interno ao redefinir sua senha."
        };
    }
}
