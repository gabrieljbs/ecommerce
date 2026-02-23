"use server";

import { calculateShipping, PackageDimensions } from "@/lib/shipping/melhor-envio";
import { db } from "@/db";
import { carts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deliveryCalc(prevState: any, formData: FormData) {
    const cep = formData.get("cep") as string;
    const cartId = formData.get("cartId") as string | null;

    if (!cep) {
        return { error: "CEP é obrigatório" };
    }

    const cleanCep = cep.replace(/\D/g, "");

    if (cleanCep.length !== 8) {
        return { error: "CEP inválido. Deve conter 8 dígitos." };
    }

    // ── Calcular dimensões reais a partir dos produtos do carrinho ────────────
    let pkg: PackageDimensions | undefined = undefined;

    if (cartId) {
        const cart = await db.query.carts.findFirst({
            where: eq(carts.id, cartId),
            with: {
                items: {
                    with: { product: true },
                },
            },
        });

        if (cart && cart.items.length > 0) {
            // Peso total em kg (schema salva em gramas)
            const totalWeightG = cart.items.reduce(
                (sum, item) => sum + item.product.weight * item.quantity,
                0
            );

            // Largura e comprimento: maior entre os itens
            const maxWidth = Math.max(...cart.items.map(i => i.product.width));
            const maxLength = Math.max(...cart.items.map(i => i.product.length));

            // Altura: soma das alturas × quantidade (empilhados)
            const totalHeight = cart.items.reduce(
                (sum, item) => sum + item.product.height * item.quantity,
                0
            );

            pkg = {
                weight: totalWeightG / 1000,        // g → kg
                width: maxWidth,
                length: maxLength,
                height: Math.min(totalHeight, 60),  // cap: 60 cm
            };

            console.log("Dimensões calculadas do carrinho:", pkg);
        }
    }

    try {
        const result = await calculateShipping(cleanCep, pkg);
        return { data: result, cep: cleanCep };
    } catch (error) {
        console.error("Erro ao calcular frete:", error);
        return { error: "Erro interno ao calcular frete." };
    }
}