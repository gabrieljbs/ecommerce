"use server";

import { db } from "@/db";
import { carts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveShipping(
    cartId: string,
    shippingPrice: number,
    shippingMethod: string,
    shippingDays: number,
    shippingZipcode: string
) {
    if (!cartId) return { error: "Carrinho não encontrado" };

    try {
        await db.update(carts)
            .set({
                shippingPrice: Math.round(shippingPrice * 100),
                shippingMethod,
                shippingDays,
                shippingZipcode,
            })
            .where(eq(carts.id, cartId));

        revalidatePath("/cart");
        return { success: true };
    } catch (error) {
        console.error("Erro ao salvar frete:", error);
        return { error: "Erro ao salvar frete" };
    }
}
