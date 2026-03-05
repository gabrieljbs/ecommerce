"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

export function ProductCarousel({ products }: { products: any[] }) {

    if (!products || products.length === 0) return null;

    const isSaleActive = (p: any) => p.sale_enabled && (!p.sale_start || new Date(p.sale_start) <= new Date()) && (!p.sale_end || new Date(p.sale_end) >= new Date());

    return (
        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0 group product-swiper-container">

            {/* Custom Navigation Arrows */}
            <button
                className="swiper-prev-btn absolute left-2 top-[45%] -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-white/90 dark:bg-black/90 shadow-xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hidden sm:flex disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeft size={24} />
            </button>

            <button
                className="swiper-next-btn absolute right-2 top-[45%] -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-white/90 dark:bg-black/90 shadow-xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hidden sm:flex disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronRight size={24} />
            </button>

            {/* Swiper Container */}
            <div className="pb-8 pt-4">
                <Swiper
                    modules={[Navigation]}
                    navigation={{
                        nextEl: '.swiper-next-btn',
                        prevEl: '.swiper-prev-btn',
                    }}
                    spaceBetween={24}
                    slidesPerView="auto"
                    breakpoints={{
                        0: {
                            slidesPerView: "auto",
                        },
                        640: {
                            slidesPerView: "auto",
                        },
                    }}
                    className="w-full"
                >
                    {products.map((p, i) => {
                        const saleActive = isSaleActive(p);

                        return (
                            <SwiperSlide key={`${p.id}-${i}`} className="!w-[80vw] sm:!w-[320px] !h-auto">
                                <Link href={`/product/${p.slug}`} className="group/card relative block border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 rounded-2xl p-3 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl transition-all h-full flex flex-col">

                                    {/* Analytics / Metric Badge */}
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

                                    <div className="aspect-[4/5] relative mb-4 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-950 shrink-0">
                                        <Image
                                            className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                                            src={p.image_url || "/placeholder.svg"}
                                            alt={p.title}
                                            fill
                                            sizes="(max-width: 640px) 100vw, 320px"
                                            draggable="false"
                                        />
                                    </div>

                                    <div className="px-1 space-y-1 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover/card:text-primary-600 dark:group-hover/card:text-primary-400 transition-colors">
                                                {p.title}
                                            </h3>

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

                                    </div>

                                    {/* Interactive Hover Area (Cart Icon) */}
                                    <div className="absolute bottom-6 right-6 opacity-0 transform translate-y-4 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300">
                                        <span className="bg-white/90 dark:bg-black/90 backdrop-blur-sm p-3 rounded-full shadow-lg block text-zinc-900 dark:text-white">
                                            <ArrowRight className="w-5 h-5" />
                                        </span>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .swiper-button-disabled {
                    opacity: 0.3 !important;
                    cursor: not-allowed !important;
                }
            `}} />
        </div>
    );
}
