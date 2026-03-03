"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

export function ProductFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Controlled inputs to prevent weird hydration or jumping
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value) {
                params.set(name, value)
            } else {
                params.delete(name)
            }
            return params.toString()
        },
        [searchParams]
    )

    const handleApplyFilters = (e: React.FormEvent) => {
        e.preventDefault();

        let currentQuery = searchParams.toString();

        if (minPrice) {
            currentQuery = createQueryString('minPrice', minPrice);
            // Re-parse it because createQueryString depends on old state
            const tempParams = new URLSearchParams(currentQuery);
            if (maxPrice) tempParams.set('maxPrice', maxPrice);
            currentQuery = tempParams.toString();
        } else {
            currentQuery = createQueryString('minPrice', '');
            const tempParams = new URLSearchParams(currentQuery);
            if (maxPrice) {
                tempParams.set('maxPrice', maxPrice)
            } else {
                tempParams.delete('maxPrice');
            }
            currentQuery = tempParams.toString();
        }

        router.push(`/product?${currentQuery}`);
    };

    return (
        <form onSubmit={handleApplyFilters} className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">R$</span>
                    <input
                        type="number"
                        name="minPrice"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="Mín"
                        className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <span className="text-zinc-400">-</span>
                <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">R$</span>
                    <input
                        type="number"
                        name="maxPrice"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Máx"
                        className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>
            <button type="submit" className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-semibold rounded-lg text-sm transition-colors cursor-pointer">
                Aplicar Filtro
            </button>
        </form>
    );
}
