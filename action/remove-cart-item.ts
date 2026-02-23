"use server";

import { db } from "@/db";
import { cart_items, carts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function removeCartItem(id: string) {
    try {
        // Busca o item para encontrar o cartId antes de deletar
        const item = await db.query.cart_items.findFirst({
            where: eq(cart_items.id, id),
        });

        if (!item) return { success: false, error: "Item não encontrado." };

        // Remove o item
        await db.delete(cart_items)
            .where(eq(cart_items.id, id));

        // Reseta o frete — o pacote mudou de peso/dimensões
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
        console.error("Erro ao remover item:", error);
        return { success: false, error: "Erro ao remover item do carrinho." };
    }
}
