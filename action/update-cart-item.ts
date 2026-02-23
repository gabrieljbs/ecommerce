"use server";

import { db } from "@/db";
import { cart_items, carts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateCartItem(id: string, quantity: number) {
    if (quantity < 1) return { success: false, error: "Quantidade inválida." };

    try {
        // Busca o item para encontrar o cartId
        const item = await db.query.cart_items.findFirst({
            where: eq(cart_items.id, id),
        });

        if (!item) return { success: false, error: "Item não encontrado." };

        // Atualiza a quantidade
        await db.update(cart_items)
            .set({ quantity })
            .where(eq(cart_items.id, id));

        // Reseta o frete — o carrinho mudou, o preço pode ser diferente
        await db.update(carts)
            .set({
                shippingPrice: null,
                shippingMethod: null,
                shippingDays: null,
                shippingZipcode: null,
            })
            .where(eq(carts.id, item.cartId));

        revalidatePath("/cart");
        return { success: true };
    } catch (error) {
        console.error("Erro ao atualizar item:", error);
        return { success: false, error: "Erro ao atualizar item no carrinho." };
    }
}
