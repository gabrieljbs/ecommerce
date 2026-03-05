"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, EffectFade, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

type Banner = {
    id: string;
    title: string;
    imageUrl: string;
    linkUrl: string | null;
    position: string;
    isActive: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export function HeroCarousel({ banners }: { banners: Banner[] }) {

    if (!banners || banners.length === 0) {
        return (
            <section className="relative overflow-hidden bg-zinc-900 dark:bg-black text-white py-20 lg:py-32">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 blur-3xl"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center space-y-8">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                            Promoções Exclusivas.
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
                            Descubra nossa coleção com as melhores ofertas do momento, selecionadas para quem busca qualidade com estilo e preços irresistíveis.
                        </p>
                        <div className="flex justify-center pt-4">
                            <Link
                                href="/product"
                                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-zinc-900 rounded-full font-semibold transition-all hover:bg-zinc-100 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                Explorar Ofertas
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative overflow-hidden bg-zinc-900 dark:bg-black text-white group/carousel hero-swiper-wrapper">

            <Swiper
                modules={[Navigation, Autoplay, EffectFade, Pagination]}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                autoHeight={false}
                speed={1000}
                autoplay={{
                    delay: 8000,
                    disableOnInteraction: false,
                }}
                navigation={{
                    nextEl: '.hero-next-btn',
                    prevEl: '.hero-prev-btn',
                }}
                pagination={{
                    el: '.hero-pagination',
                    clickable: true,
                    bulletClass: 'hero-bullet',
                    bulletActiveClass: 'hero-bullet-active'
                }}
                loop={banners.length > 1}
                allowTouchMove={true}
                className="w-full h-full"
            >
                {banners.map((banner, index) => (
                    <SwiperSlide key={banner.id} className="relative w-full aspect-[2752/1536] flex items-center">

                        {/* Background Image Setup for this specific slide */}
                        <div className="absolute inset-0 w-full h-full">
                            <Image
                                src={banner.imageUrl}
                                alt={banner.title}
                                fill
                                className="object-cover opacity-80 mix-blend-overlay"
                                priority={index === 0}
                            />
                        </div>
                        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none"></div>

                        {/* Front Content Layer */}
                        {/* Ficara comentato ate que eu defina o stilo do carrossel */}
                        {/* <div className="container mx-auto px-4 relative z-10 w-full">
                            <div className="max-w-3xl mx-auto text-center space-y-8">
                                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg mb-6">
                                    {banner.title}
                                </h1>
                                <p className="text-lg md:text-xl text-zinc-300 leading-relaxed max-w-2xl mx-auto mb-8 drop-shadow-md">
                                    Descubra nossa coleção com as melhores ofertas do momento, selecionadas para quem busca qualidade com estilo e preços irresistíveis.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                    <Link
                                        href={banner.linkUrl || "/product"}
                                        className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-zinc-900 rounded-full font-semibold transition-all hover:bg-zinc-100 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                                    >
                                        <ShoppingBag className="w-5 h-5" />
                                        {banner.linkUrl ? "Aproveitar Agora" : "Explorar Ofertas"}
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </div> */}

                    </SwiperSlide>
                ))}

                {/* Controls */}
                {banners.length > 1 && (
                    <>
                        <button
                            className="hero-prev-btn absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/50 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 transform -translate-x-4 group-hover/carousel:translate-x-0"
                            aria-label="Banner anterior"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            className="hero-next-btn absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/50 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 transform translate-x-4 group-hover/carousel:translate-x-0"
                            aria-label="Próximo banner"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Dot Indicators */}
                {banners.length > 1 && (
                    <div className="hero-pagination absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-20"></div>
                )}
            </Swiper>

            <style dangerouslySetInnerHTML={{
                __html: `
                .hero-bullet {
                    width: 8px;
                    height: 8px;
                    background: rgba(255,255,255,0.5);
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: inline-block;
                }
                .hero-bullet:hover {
                    background: rgba(255,255,255,0.8);
                }
                .hero-bullet-active {
                    background: white;
                    width: 32px;
                    border-radius: 4px;
                }
            `}} />
        </section>
    );
}
