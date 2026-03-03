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
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                Ofertas Imperdíveis Ativas
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Aproveite enquanto dura. Produtos que estão em promoção agora por tempo limitado.
              </p>
            </div>
            <Link
              href="/product?onSale=true"
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 group whitespace-nowrap"
            >
              Ver todas
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <ProductCarousel products={products} />

        </section>
      )}
    </main>
  );
}
