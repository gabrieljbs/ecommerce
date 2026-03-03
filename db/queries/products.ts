import { sql } from "drizzle-orm";
import { db } from "../index";

export async function getProducts(options?: { limit?: number, minPrice?: number, maxPrice?: number, sort?: string, onSale?: boolean }) {

    const limitClause = options?.limit ? sql`LIMIT ${options.limit}` : sql``;

    // Building the dynamic WHERE clause
    const conditions = [];

    const currentPriceSql = sql`CASE WHEN p.sale_enabled = true AND (p.sale_start IS NULL OR p.sale_start <= NOW()) AND (p.sale_end IS NULL OR p.sale_end >= NOW()) THEN p.sale_price ELSE p.price END`;

    if (options?.minPrice !== undefined) {
        conditions.push(sql`${currentPriceSql} >= ${options.minPrice}`);
    }

    if (options?.maxPrice !== undefined) {
        conditions.push(sql`${currentPriceSql} <= ${options.maxPrice}`);
    }

    if (options?.onSale) {
        conditions.push(sql`p.sale_enabled = true AND (p.sale_start IS NULL OR p.sale_start <= NOW()) AND (p.sale_end IS NULL OR p.sale_end >= NOW())`);
    }

    const whereClause = conditions.length > 0
        ? sql`WHERE ${sql.join(conditions, sql` AND `)}`
        : sql``;

    // Building dynamic ORDER BY
    let orderClause = sql`ORDER BY p.id ASC`; // Default is distinct requirement

    if (options?.sort === 'price_asc') {
        orderClause = sql`ORDER BY p.id ASC, ${currentPriceSql} ASC`;
    } else if (options?.sort === 'price_desc') {
        orderClause = sql`ORDER BY p.id ASC, ${currentPriceSql} DESC`;
    } else if (options?.sort === 'newest') {
        orderClause = sql`ORDER BY p.id ASC, p.created_at DESC`;
    }

    const result = await db.execute(sql`
        SELECT DISTINCT ON (p.id)
            p.id, 
            p.title, 
            p.price,
            p.original_price,
            p.sale_price,
            p.sale_start,
            p.sale_end,
            p.sale_enabled,
            p.description,
            p.slug,
            p.created_at,
            pi.url as image_url
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = true
        ${whereClause}
        ${orderClause}
        ${limitClause}
    `);

    // In PostgreSQL, DISTINCT ON requires the columns to match the beginning of the ORDER BY clause. 
    // We sort in application memory for price sorting edge cases if needed, but db handled here.
    let rows = result.rows;

    const getActualPrice = (p: any) => {
        const isSaleActive = p.sale_enabled && (!p.sale_start || new Date(p.sale_start) <= new Date()) && (!p.sale_end || new Date(p.sale_end) >= new Date());
        return isSaleActive ? p.sale_price : p.price;
    };

    if (options?.sort === 'price_asc') {
        rows = rows.sort((a: any, b: any) => getActualPrice(a) - getActualPrice(b));
    } else if (options?.sort === 'price_desc') {
        rows = rows.sort((a: any, b: any) => getActualPrice(b) - getActualPrice(a));
    } else if (options?.sort === 'newest') {
        rows = rows.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return rows;
}

export async function getSaleProducts(limit?: number) {
    const limitClause = limit ? sql`LIMIT ${limit}` : sql``;

    const result = await db.execute(sql`
        SELECT DISTINCT ON (p.id)
            p.id, 
            p.title, 
            p.price,
            p.original_price, 
            p.sale_price,
            p.sale_start,
            p.sale_end,
            p.sale_enabled,
            p.description,
            p.slug,
            pi.url as image_url
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = true
        WHERE p.sale_enabled = true 
          AND (p.sale_start IS NULL OR p.sale_start <= NOW())
          AND (p.sale_end IS NULL OR p.sale_end >= NOW())
        ${limitClause}
    `);

    return result.rows;
}