"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendPasswordResetEmail } from "@/lib/mail";
import crypto from "crypto";
import { cookies } from "next/headers";

export async function forgotPassword(prevState: any, formData: FormData): Promise<{ success: boolean; error?: string; message?: string }> {
    const cookieStore = await cookies();
    const attemptsCookie = cookieStore.get("forgot_attempts");
    const currentAttempts = attemptsCookie ? parseInt(attemptsCookie.value) : 0;

    // Antispam básico
    if (currentAttempts >= 3) {
        return {
            success: false,
            error: "Muitas tentativas. Tente novamente mais tarde.",
        };
    }

    const email = formData.get("email") as string;

    if (!email) {
        return { success: false, error: "Preencha o seu e-mail." };
    }

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        // 🛡️ Segurança: Por mais que o usuário não exista, o frontend vai dizer "Email enviado"
        // Isso impede que hackers usem essa tela pra testar quais e-mails existem no seu site (Data Leak).
        if (!user) {
            return {
                success: true,
                message: "Se este e-mail for válido, enviaremos um link de recuperação pra ele em instantes."
            };
        }

        // Se o usuário existir, gera o token
        const resetToken = crypto.randomUUID();
        const expirationDate = new Date(Date.now() + 1 * 60 * 60 * 1000); // +1 Hora de validade

        // Atualiza o banco com as chaves secretas temporárias
        await db.update(users)
            .set({
                passwordResetToken: resetToken,
                passwordResetExpires: expirationDate
            })
            .where(eq(users.id, user.id));

        // Dispara o e-mail pro cliente:
        await sendPasswordResetEmail(user.email, resetToken);

        // Bloqueio antispam
        cookieStore.set("forgot_attempts", (currentAttempts + 1).toString(), {
            httpOnly: true,
            maxAge: 30 * 60, // 30 mins
        });

        return {
            success: true,
            message: "Se este e-mail for válido, enviaremos um link de recuperação pra ele em instantes."
        };

    } catch (error) {
        console.error("ERRO NO FORGOT PASSWORD:", error);
        return {
            success: false,
            error: "Ocorreu um erro interno ao processar a solicitação."
        };
    }
}
