import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions, users } from "@/db/schema"; // Ensure correct import if table name is sessions. Based on schema.ts it is sessions.
import { eq } from "drizzle-orm";

export async function auth() {
    const cookiesStore = await cookies();
    const sessionId = cookiesStore.get("session_id")?.value;

    if (!sessionId) {
        return null;
    }

    const session = await db.query.sessions.findFirst({
        where: eq(sessions.id, sessionId),
        with: {
            user: true,
        },
    });

    if (!session || new Date() > session.expiresAt) {
        return null;
    }

    return session.user;
}