"use client"

import { useRouter, useSearchParams } from "next/navigation";

export function ProductSort() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentSort = searchParams.get('sort') || 'relevance';

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const params = new URLSearchParams(searchParams.toString());

        if (value && value !== 'relevance') {
            params.set('sort', value);
        } else {
            params.delete('sort');
        }

        router.push(`/product?${params.toString()}`);
    }

    return (
        <select
            value={currentSort}
            onChange={handleSortChange}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
            <option value="relevance">Relevância</option>
            <option value="price_asc">Menor Preço</option>
            <option value="price_desc">Maior Preço</option>
            <option value="newest">Mais Recentes</option>
        </select>
    );
}
