export const runtime = "nodejs";

import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug } from "@/db/queries/get-product-by-slug";
import { addToCart } from "@/action/add-to-cart";

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;
    const product = (await getProductBySlug(slug)) as any;

    if (!product) return notFound();

    return (
        <main className="container mx-auto p-8 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="aspect-square relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                <div className="flex flex-col justify-center">
                    <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
                    <p className="text-2xl text-emerald-600 dark:text-emerald-400 font-bold mb-6">
                        R$ {Number(product.price).toFixed(2)}
                    </p>
                    <div className="prose dark:prose-invert">
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            {product.description}
                        </p>
                    </div>

                    <form action={addToCart}>
                        <input type="hidden" name="productId" value={product.id} />
                        <button
                            type="submit"
                            className="w-full mt-8 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 py-4 px-8 rounded-full font-semibold hover:opacity-90 transition-opacity active:scale-[0.98]"
                        >
                            Adicionar ao Carrinho
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
