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
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">{product.title}</h1>

                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <p className="text-3xl text-primary-600 dark:text-primary-400 font-extrabold flex items-center gap-2">
                                {Number((product.sale_price ? product.sale_price : product.price) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                            {product.sale_price && (
                                <p className="text-lg text-zinc-400 dark:text-zinc-500 font-medium line-through">
                                    {Number(product.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                            )}
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium tracking-wide">
                            em até <strong className="text-zinc-700 dark:text-zinc-300">6x de {Number((product.sale_price ? product.sale_price : product.price) / 100 / 6).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong> sem juros
                        </p>
                    </div>

                    <div className="prose dark:prose-invert mt-2">
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {product.description}
                        </p>
                    </div>
                    <AddToCartButton productId={product.id} stock={product.stock} />
                </div>

                {/* Coluna 3: Entrega */}
                <div className="col-span-2">
                    <Delivery />
                </div>
            </div>
        </main>
    );
}
