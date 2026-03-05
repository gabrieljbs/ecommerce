import { getSaleProducts } from "@/db/queries/products";
import { getActiveBannersByPosition } from "@/db/queries/banners";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroCarousel } from "@/components/ui/HeroCarousel";
import { ProductCarousel } from "@/components/ui/ProductCarousel";

export default async function Home() {
  const products = await getSaleProducts(8);
  const banners = await getActiveBannersByPosition("home_hero");

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">

      {/* Hero Section Banner Carousel */}
      <HeroCarousel banners={banners} />

      {/* Featured Products Section */}
      {products.length > 0 && (
        <section className="py-16 md:py-24 container mx-auto px-4 overflow-hidden">
          <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-12 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-zinc-100 dark:border-zinc-800/50 pb-6">
              <div>
                <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                  <span className="text-primary-600">Ofertas</span> Imperdíveis
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl">
                  Aproveite enquanto dura. Produtos com descontos exclusivos por tempo limitado.
                </p>
              </div>
              <Link
                href="/product?onSale=true"
                className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 group whitespace-nowrap bg-zinc-50 dark:bg-zinc-800 px-5 py-2.5 rounded-full transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
              >
                Ver vitrine completa
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-8">
              <ProductCarousel products={products} />
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
