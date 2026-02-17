import { getProducts } from "@/db/queries/products";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

export default async function Home() {
  const products = await getProducts(8);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-zinc-900 dark:bg-black text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Eleve seu Estilo ao Próximo Nível.
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              Descubra nossa coleção exclusiva de produtos selecionados para quem busca qualidade, design e performance em cada detalhe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link
                href="/product"
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-zinc-900 rounded-full font-semibold transition-all hover:bg-zinc-100 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
              >
                <ShoppingBag className="w-5 h-5" />
                Explorar Coleção
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/about"
                className="text-zinc-400 hover:text-white font-medium transition-colors px-6 py-4"
              >
                Saiba mais
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24 container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              Destaques da Semana
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              As melhores escolhas selecionadas para você.
            </p>
          </div>
          <Link
            href="/product"
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 group"
          >
            Ver todos
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((product: any) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group block"
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 mb-4 border border-zinc-200 dark:border-zinc-800">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />

                {/* Floating "Quick Add" button could go here, keeping it clean for now */}
                <div className="absolute bottom-4 right-4 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <span className="bg-white/90 dark:bg-black/90 backdrop-blur-sm p-3 rounded-full shadow-lg block text-zinc-900 dark:text-white">
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {product.title}
                </h3>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  R$ {Number(product.price).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
