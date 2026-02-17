"use server";

import { db } from "@/db";
import { cart_items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function removeCartItem(id: string) {
    await db.delete(cart_items)
        .where(eq(cart_items.id, id));

    revalidatePath("/cart");
}
