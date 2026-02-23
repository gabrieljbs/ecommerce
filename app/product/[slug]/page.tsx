export const runtime = "nodejs";

import { notFound } from "next/navigation";
import { getProductBySlug } from "@/db/queries/get-product-by-slug";
import { ProductGallery } from "@/components/Product/ProductGallery";
import Delivery from "@/components/Delivery/delivery";
import AddToCartButton from "@/components/Product/AddToCartButton";

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;
    const product = (await getProductBySlug(slug)) as any;

    if (!product) return notFound();

    return (
        <main className="container mx-auto p-8 max-w-6xl">

            <div className="grid grid-cols-3 gap-8 items-start">
                {/* Coluna 1: Galeria */}
                <div className="col-span-1">
                    <ProductGallery images={product.images} productTitle={product.title} />
                </div>

                {/* Coluna 2: Info do produto + Botão */}
                <div className="col-span-1 flex flex-col gap-4">
                    <h1 className="text-4xl font-bold">{product.title}</h1>
                    <p className="text-2xl text-emerald-600 dark:text-emerald-400 font-bold">
                        {Number(product.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <div className="prose dark:prose-invert">
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {product.description}
                        </p>
                    </div>
                    <AddToCartButton productId={product.id} />
                </div>

                {/* Coluna 3: Entrega */}
                <div className="col-span-2">
                    <Delivery />
                </div>
            </div>
        </main>
    );
}
