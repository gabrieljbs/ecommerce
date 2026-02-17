import { db } from "@/db";
import { carts, cart_items, products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCart(sessionId: string | undefined) {
    if (!sessionId) return null;

    const cart = await db.query.carts.findFirst({
        where: eq(carts.sessionId, sessionId),
        with: {
            items: {
                with: {
                    product: true,
                },
            },
        },
    });

    return cart ?? null;
}
