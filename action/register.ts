"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { auth } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/mail";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function register(prevState: any, formData: FormData) {
    const cookieStore = await cookies();
    const attemptsCookie = cookieStore.get("register_attempts");
    const currentAttempts = attemptsCookie ? parseInt(attemptsCookie.value) : 0;
    const maxAttempts = 3;

    // Se já excedeu as tentativas, bloqueia
    if (currentAttempts >= maxAttempts) {
        return {
            success: false,
            error: "Muitas tentativas falhas. Tente novamente mais tarde.",
            attempts: currentAttempts
        };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
        return {
            success: false,
            error: "Preencha todos os campos.",
            attempts: currentAttempts // Validação básica não queima tentativa de segurança
        };
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        // 1. Cria a conta do Usuário como "Não Verificado" (emailVerified: false nativo pelo SQL)
        // E já cria o Token de segurança na própria tabela users
        const novoToken = crypto.randomUUID();
        const expirationDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // +2 Horas

        const [user] = await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
            emailVerified: false,
            emailVerificationToken: novoToken,
            emailVerificationExpires: expirationDate,
        }).returning();

        if (!user) {
            // Falha inesperada, conta como tentativa
            const newAttempts = currentAttempts + 1;
            cookieStore.set("register_attempts", newAttempts.toString(), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60, // 1 hora
                path: "/",
            });

            return {
                success: false,
                error: "Erro ao criar usuário.",
                attempts: newAttempts
            };
        }

        // 3. Dispara magicamente o Nodemailer (em background invisível pro usuário pra não travar tela)
        await sendVerificationEmail(user.email, novoToken);

        // Sucesso: Limpa o cookie de tentativas
        cookieStore.delete("register_attempts");

        return {
            success: true,
            message: "Em poucos segundos um link de verificação chegará na sua caixa de entrada.", // Mudança de copy pro Frontend
            attempts: 0
        };
    } catch (error: any) {
        console.error("REGISTER ERROR:", error);

        // Verifica se é erro de duplicidade (código Postgres 23505)

        if (
            error.code === '23505' ||
            error.cause?.code === '23505' ||
            error.message?.includes("already exists") ||
            error.detail?.includes("already exists") ||
            error.cause?.detail?.includes("already exists") ||
            error.constraint?.includes("users_email_unique") ||
            error.constraint?.includes("users_email_key") ||
            error.cause?.constraint?.includes("users_email_unique") ||
            error.cause?.constraint?.includes("users_email_key")
        ) {
            return {
                success: false,
                error: "Este email já está cadastrado.",
                attempts: currentAttempts // Não conta como tentativa falha de segurança
            };
        }

        // Outros erros contam como tentativa
        const newAttempts = currentAttempts + 1;
        cookieStore.set("register_attempts", newAttempts.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60, // 1 hora
            path: "/",
        });

        return {
            success: false,
            error: "Não foi possível criar a conta. Tente novamente.",
            attempts: newAttempts
        };
    }
}   