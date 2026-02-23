import { sql } from "drizzle-orm";
import { db } from "../index";

export async function getProducts(limit?: number) {
    const limitClause = limit ? sql`LIMIT ${limit}` : sql``;

    const result = await db.execute(sql`
        SELECT DISTINCT ON (p.id)
            p.id, 
            p.title, 
            p.price, 
            p.description,
            p.slug,
            pi.url as image_url
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = true
        ${limitClause}
    `);

    return result.rows;
}