"use server";

import { db } from "../db";
import { carts, cart_items } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { getCartSession } from "../lib/cart-session";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function addToCart(_prevState: unknown, formData: FormData) {
    try {
        const raw = formData.get("productId");

        if (!raw || typeof raw !== "string") {
            return { success: false, error: "Produto inválido." };
        }

        const productId = raw;

        let sessionId = await getCartSession();

        if (!sessionId) {
            sessionId = crypto.randomUUID();

            const cookieStore = await cookies();
            cookieStore.set("cart_session", sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24 * 7,
                path: "/",
            });
        }

        let cart = await db.query.carts.findFirst({
            where: eq(carts.sessionId, sessionId),
        });

        if (!cart) {
            const created = await db.insert(carts)
                .values({ sessionId })
                .returning();
            cart = created[0];
        }

        if (!cart) return { success: false, error: "Não foi possível criar o carrinho." };

        const existing = await db.query.cart_items.findFirst({
            where: and(
                eq(cart_items.cartId, cart.id),
                eq(cart_items.productId, productId)
            ),
        });

        if (existing) {
            await db.update(cart_items)
                .set({ quantity: existing.quantity + 1 })
                .where(eq(cart_items.id, existing.id));
        } else {
            await db.insert(cart_items).values({
                cartId: cart.id,
                productId,
                quantity: 1,
            });
        }

        // revalida corretamente
        revalidatePath("/", "layout");
        revalidatePath("/cart");

        return { success: true };
    } catch (error) {
        console.error("Erro ao adicionar item ao carrinho:", error);
        return { success: false, error: "Erro interno ao adicionar ao carrinho." };
    }
}
