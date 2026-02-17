"use server";

import { db } from "@/db";
import { cart_items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateCartItem(id: string, quantity: number) {
    if (quantity < 1) return;

    await db.update(cart_items)
        .set({ quantity })
        .where(eq(cart_items.id, id));

    revalidatePath("/cart");
}
