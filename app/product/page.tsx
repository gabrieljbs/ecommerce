import { getProducts } from "@/db/queries/products";
import Image from "next/image";
import Link from "next/link";


export default async function ProductPage() {
    const products = await getProducts();
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8">Nossos Produtos</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((p: any) => (

                    <div key={p.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow p-4 bg-white dark:bg-zinc-900 dark:border-zinc-800">
                        <Link href={`/product/${p.slug}`}>
                            <div className="aspect-square relative mb-4">
                                <Image
                                    className="object-cover rounded-md"
                                    src={p.image_url || "/placeholder.svg"}
                                    alt={p.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>
                            <h2 className="text-lg font-semibold mb-2">{p.title}</h2>
                            <p className="text-emerald-600 dark:text-emerald-400 font-bold">{Number(p.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}