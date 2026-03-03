"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateProfileData(formData: FormData) {

    const user = await auth();

    if (!user) {
        return { error: "Não autorizado." };
    }

    const name = formData.get("name") as string;
    const currentPassword = formData.get("current_password") as string;
    const newPassword = formData.get("new_password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (!name || name.trim() === "") {
        return { error: "O nome não pode ficar vazio." };
    }

    // Handle Password Update Flow
    if (newPassword || currentPassword) {
        if (!currentPassword) {
            return { error: "Você deve informar a senha atual para alterá-la." };
        }
        if (newPassword !== confirmPassword) {
            return { error: "As novas senhas não coincidem." };
        }
        if (newPassword.length < 6) {
            return { error: "A nova senha deve ter no mínimo 6 caracteres." };
        }

        // Verify current password
        const userRecord = await db.query.users.findFirst({
            where: eq(users.id, user.id)
        });

        if (!userRecord) return { error: "Usuário não encontrado." };

        const passwordMatch = await bcrypt.compare(currentPassword, userRecord.password);

        if (!passwordMatch) {
            return { error: "A senha atual está incorreta." };
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update both name and password
        await db.update(users)
            .set({
                name,
                password: hashedNewPassword,
                updatedAt: new Date()
            })
            .where(eq(users.id, user.id));

    } else {
        // Only update name
        await db.update(users)
            .set({
                name,
                updatedAt: new Date()
            })
            .where(eq(users.id, user.id));
    }

    revalidatePath("/profile/dados");
    return { success: "Dados atualizados com sucesso!" };
}
