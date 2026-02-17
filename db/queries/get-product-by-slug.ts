import { db } from "../index";

export async function getProductBySlug(slug: string) {
    const product = await db.query.products.findFirst({
        where: (products, { eq }) => eq(products.slug, slug),
        with: {
            images: true,
        },
    });

    if (!product) return null;

    return {
        ...product,
        image: product.images[0]?.url,
    };
}   