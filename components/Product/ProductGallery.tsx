"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductImage {
    id: string;
    url: string | null;
    alt: string | null;
    is_main: boolean | null;
    position: number | null;
}

interface ProductGalleryProps {
    images: ProductImage[];
    productTitle: string;
}

export function ProductGallery({ images, productTitle }: ProductGalleryProps) {
    // Ordenar imagens por is_main e position se existirem
    const sortedImages = [...images].sort((a, b) => {
        if (a.is_main) return -1;
        if (b.is_main) return 1;
        return (a.position || 0) - (b.position || 0);
    });

    // Estado inicial: imagem principal ou a primeira da lista
    const [selectedImage, setSelectedImage] = useState<ProductImage | null>(
        sortedImages.find((img) => img.is_main) || sortedImages[0] || null
    );

    if (!selectedImage) {
        return (
            <div className="aspect-square relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <span className="text-zinc-400">Sem imagem</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Imagem Principal */}
            <div className="aspect-square relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
                <Image
                    src={selectedImage.url || "/placeholder.svg"}
                    alt={selectedImage.alt || productTitle}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
            </div>

            {/* Galeria de Miniaturas */}
            <div className="grid grid-cols-4 gap-4">
                {sortedImages.map((image) => (
                    <button
                        key={image.id}
                        onClick={() => setSelectedImage(image)}
                        className={cn(
                            "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                            selectedImage.id === image.id
                                ? "border-zinc-900 dark:border-white ring-2 ring-zinc-900/10 dark:ring-white/10"
                                : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
                        )}
                    >
                        <Image
                            src={image.url || "/placeholder.svg"}
                            alt={image.alt || productTitle}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 25vw, 10vw"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
