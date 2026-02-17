import { sql } from "drizzle-orm";
import { db } from "../index";

export async function getProducts(limit?: number) {
    if (limit) {
        const result = await db.execute(sql`SELECT id, title, price, slug FROM products LIMIT ${limit}`);
        return result.rows;
    }
    const result = await db.execute(sql`SELECT id, title, price, slug FROM products`);
    return result.rows;
}