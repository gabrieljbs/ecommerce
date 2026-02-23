"use server";

import { db } from "@/db";
import { sessions } from "@/db/schema";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function logout() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (sessionId) {
        await db.delete(sessions).where(eq(sessions.id, sessionId));
    }

    cookieStore.delete("session_id");
    cookieStore.delete("cart_session");
    cookieStore.delete("user_data");

    redirect("/");
}
