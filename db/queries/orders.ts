import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getUserOrders(userId: string) {
    return await db.query.orders.findMany({
        where: eq(orders.userId, userId),
        orderBy: [desc(orders.createdAt)],
        with: {
            items: true,
            payments: true,
        }
    });
}
