"use server";

import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function login(prevState: any, formData: FormData) {
    const cookieStore = await cookies();
    const attemptsCookie = cookieStore.get("login_attempts");
    const currentAttempts = attemptsCookie ? parseInt(attemptsCookie.value) : 0;
    const maxAttempts = 5;

    if (currentAttempts >= maxAttempts) {
        return {
            success: false,
            error: "Muitas tentativas falhas. Tente novamente mais tarde.",
            attempts: currentAttempts
        };
    }

    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email || !password) {
            return {
                success: false,
                error: "Preencha todos os campos.",
                attempts: currentAttempts
            };
        }

        const [user] = await db.select().from(users).where(eq(users.email, email));

        if (!user) {
            // Usuario nao encontrado conta como falha
            const newAttempts = currentAttempts + 1;
            cookieStore.set("login_attempts", newAttempts.toString(), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60, // 1 hora
                path: "/",
            });

            return {
                success: false,
                error: "Credenciais inválidas.",
                attempts: newAttempts
            };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // Senha errada conta como falha
            const newAttempts = currentAttempts + 1;
            cookieStore.set("login_attempts", newAttempts.toString(), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60, // 1 hora
                path: "/",
            });

            return {
                success: false,
                error: "Credenciais inválidas.",
                attempts: newAttempts
            };
        }

        // --- SUCESSO DE SENHA ---

        if (!user.emailVerified) {
            return {
                success: false,
                error: "Por favor, ative sua conta através do link que enviamos no seu e-mail antes de fazer login.",
                attempts: currentAttempts // Aviso de segurança não conta como quebra de senha
            };
        }

        // 1. Criar Sessão no Banco
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
        const [session] = await db.insert(sessions).values({
            userId: user.id,
            expiresAt: expiresAt,
        }).returning();

        // 2. Setar Cookie de Sessão
        cookieStore.set("session_id", session.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            expires: expiresAt,
            path: "/",
        });

        // 3. Limpar tentativas falhas
        cookieStore.delete("login_attempts");

        return { success: true, attempts: 0 };

    } catch (error) {
        console.error("Erro ao fazer login:", error);
        return {
            success: false,
            error: "Erro interno ao fazer login.",
            attempts: currentAttempts
        };
    }
}   