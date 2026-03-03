import { db } from "../index";
import { banners } from "../schema";
import { eq, and, or, isNull, lte, gte } from "drizzle-orm";

export async function getActiveBannerByPosition(position: string) {
    try {
        const now = new Date();
        const result = await db.query.banners.findFirst({
            where: and(
                eq(banners.position, position),
                eq(banners.isActive, true),
                or(isNull(banners.startsAt), lte(banners.startsAt, now)),
                or(isNull(banners.endsAt), gte(banners.endsAt, now))
            ),
            orderBy: (banners, { desc }) => [desc(banners.createdAt)],
        });

        return result;
    } catch (error) {
        console.error(`Erro ao buscar banner para a posição ${position}:`, error);
        return null;
    }
}

export async function getActiveBannersByPosition(position: string) {
    try {
        const now = new Date();
        const results = await db.query.banners.findMany({
            where: and(
                eq(banners.position, position),
                eq(banners.isActive, true),
                or(isNull(banners.startsAt), lte(banners.startsAt, now)),
                or(isNull(banners.endsAt), gte(banners.endsAt, now))
            ),
            orderBy: (banners, { desc }) => [desc(banners.createdAt)],
        });

        return results;
    } catch (error) {
        console.error(`Erro ao buscar banners múltiplos para a posição ${position}:`, error);
        return [];
    }
}
