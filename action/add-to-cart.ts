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
        const qtyRaw = formData.get("quantity");
        const quantityToAdd = qtyRaw ? parseInt(qtyRaw.toString(), 10) : 1;

        if (quantityToAdd <= 0) {
            return { success: false, error: "Quantidade inválida." };
        }

        const product = await db.query.products.findFirst({
            where: (products, { eq }) => eq(products.id, productId)
        });

        if (!product) {
            return { success: false, error: "Produto não encontrado." };
        }

        if (product.stock <= 0) {
            return { success: false, error: "Este produto está esgotado no momento." };
        }

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
            const newQuantity = existing.quantity + quantityToAdd;
            if (newQuantity > product.stock) {
                return { success: false, error: `Desculpe, só temos ${product.stock} unidades em estoque. Você já tem ${existing.quantity} no carrinho.` };
            }

            await db.update(cart_items)
                .set({ quantity: newQuantity })
                .where(eq(cart_items.id, existing.id));
        } else {
            if (quantityToAdd > product.stock) {
                return { success: false, error: `Desculpe, só temos ${product.stock} unidades em estoque.` };
            }

            await db.insert(cart_items).values({
                cartId: cart.id,
                productId,
                quantity: quantityToAdd,
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
