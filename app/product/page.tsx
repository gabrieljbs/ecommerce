import { getProducts } from "@/db/queries/products";
import Image from "next/image";
import Link from "next/link";
import { Filter, ChevronDown, ArrowRight } from "lucide-react";
import { ProductFilters } from "@/components/Forms/ProductFilters";
import { ProductSort } from "@/components/Forms/ProductSort";
import { CountdownTimer } from "@/components/ui/CountdownTimer";

// For the purpose of rendering the new layout, we adapt this page to be a Server Component that could read Search Params
export default async function ProductPage({ searchParams }: { searchParams: Promise<{ minPrice?: string, maxPrice?: string, sort?: string, onSale?: string }> }) {

    const { minPrice, maxPrice, sort, onSale } = await searchParams;
    const options = {
        minPrice: minPrice ? Number(minPrice) * 100 : undefined, // Convert to cents
        maxPrice: maxPrice ? Number(maxPrice) * 100 : undefined,
        sort: sort,
        onSale: onSale === 'true'
    };

    const products = await getProducts(options);

    const isSaleActive = (p: any) => p.sale_enabled && (!p.sale_start || new Date(p.sale_start) <= new Date()) && (!p.sale_end || new Date(p.sale_end) >= new Date());

    return (
        <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen">
            {/* Header / Breadcrumb Banner */}
            <div className="bg-white dark:bg-black border-b-2 border-primary-500 dark:border-primary-600">
                <div className="container mx-auto px-4 py-8 md:py-12">
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4">
                        Toda a Coleção
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl text-lg">
                        Explore nossa curadoria completa de peças. Utilize os filtros laterais para encontrar exatamente o que você procura pelo melhor preço.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-64 shrink-0 space-y-8">
                        {/* Mobile Filter Toggle */}
                        <div className="lg:hidden flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                            <span className="font-semibold flex items-center gap-2">
                                <Filter size={18} /> Filtros
                            </span>
                            <ChevronDown size={20} />
                        </div>

                        <div className="hidden lg:block space-y-8 sticky top-24">

                            {/* Categoria Filter Placeholder */}
                            <div>
                                <h3 className="font-bold text-lg mb-4 text-zinc-900 dark:text-white">Categorias</h3>
                                <ul className="space-y-3 font-medium text-zinc-600 dark:text-zinc-400">
                                    <li><Link href="/product" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex justify-between">Todos <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-xs">{products.length}</span></Link></li>
                                    <li><Link href="/product?onSale=true" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors flex justify-between font-bold">Ofertas</Link></li>
                                </ul>
                            </div>

                            <hr className="border-zinc-200 dark:border-zinc-800" />

                            {/* Preço Filter Component */}
                            <div>
                                <h3 className="font-bold text-lg mb-4 text-zinc-900 dark:text-white">Faixa de Preço</h3>
                                <ProductFilters />
                            </div>

                        </div>
                    </aside>

                    {/* Product Grid Area */}
                    <div className="flex-1">

                        {/* Topbar Sorting */}
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                Exibindo <span className="font-bold text-zinc-900 dark:text-white">{products.length}</span> produtos
                            </p>

                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-zinc-500">Ordenar por:</span>
                                <ProductSort />
                            </div>
                        </div>

                        {/* Loading / Empty States Could go here */}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((p: any) => {
                                const saleActive = isSaleActive(p);

                                return (
                                    <Link key={p.id} href={`/product/${p.slug}`} className="group relative border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl transition-all block overflow-hidden">

                                        {/* Analytics / Metric Badge (Visual enhancement requested by user) */}
                                        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                                            {saleActive && (
                                                <span className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-md w-fit">
                                                    Promoção
                                                </span>
                                            )}
                                            {saleActive && p.sale_end && (
                                                <CountdownTimer endDate={p.sale_end} />
                                            )}
                                        </div>

                                        <div className="aspect-[864/1184] relative mb-4 bg-zinc-100 dark:bg-zinc-950">
                                            <Image
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                src={p.image_url || "/placeholder.svg"}
                                                alt={p.title}
                                                fill
                                                sizes="(max-width: 640px) 100vw, 320px"
                                            />
                                        </div>

                                        <div className="px-5 pb-5 space-y-1">
                                            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{p.title}</h2>

                                            <div className="flex flex-col gap-0.5 pt-1">
                                                <div className="flex items-center gap-2">
                                                    {saleActive ? (
                                                        <>
                                                            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                                                {Number(p.sale_price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                            </p>
                                                            <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 line-through">
                                                                {Number((p.original_price > 0 ? p.original_price : p.price) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <p className="text-xl font-extrabold text-zinc-900 dark:text-white">
                                                            {Number(p.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                                    em até <strong className="text-zinc-700 dark:text-zinc-300">6x de {Number((saleActive ? p.sale_price : p.price) / 100 / 6).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong> s/ juros
                                                </p>
                                            </div>
                                        </div>

                                        {/* Interactive Hover Area (Cart Icon) */}
                                        <div className="absolute bottom-6 right-6 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                            <span className="bg-primary-600 p-2 rounded-full shadow-lg flex text-white">
                                                <ArrowRight className="w-5 h-5" />
                                            </span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}