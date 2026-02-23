"use server";

import { db } from "@/db";
import { carts, orders, orderItems, cart_items } from "@/db/schema";
import { getCartSession } from "@/lib/cart-session";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function placeOrder(prevState: any, formData: FormData) {
    const user = await auth();
    if (!user) {
        return { error: "Você precisa estar logado para finalizar a compra." };
    }

    const sessionId = await getCartSession();
    if (!sessionId) {
        return { error: "Carrinho não encontrado." };
    }

    const cart = await db.query.carts.findFirst({
        where: eq(carts.sessionId, sessionId),
        with: {
            items: {
                with: { product: true },
            },
        },
    });

    if (!cart || cart.items.length === 0) {
        return { error: "Seu carrinho está vazio." };
    }

    if (!cart.shippingPrice) {
        return { error: "Selecione um método de frete antes de finalizar." };
    }

    // ── Dados do endereço (Etapa 1) ──────────────────────────────────────────
    const address = formData.get("address") as string;
    const number = formData.get("number") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const neighborhood = formData.get("neighborhood") as string | null;
    const complement = formData.get("complement") as string | null;

    if (!address || !number || !city || !state) {
        return { error: "Preencha todos os campos obrigatórios do endereço." };
    }

    // ── Dados do cliente (Etapa 2) ────────────────────────────────────────────
    const customerName = (formData.get("customerName") as string) || user.name;
    const customerEmail = (formData.get("customerEmail") as string) || user.email;
    const customerPhone = formData.get("customerPhone") as string | null;
    const customerDocument = formData.get("customerDocument") as string | null;

    if (!customerName || !customerEmail) {
        return { error: "Nome e e-mail são obrigatórios." };
    }

    // ── Cálculo de totais ─────────────────────────────────────────────────────
    const subtotal = cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    const shippingPrice = cart.shippingPrice;   // já em centavos
    const discount = 0;
    const total = subtotal + shippingPrice - discount;

    let newOrderId: string | null = null;

    try {
        await db.transaction(async (tx) => {
            // 1. Criar o pedido
            const [newOrder] = await tx.insert(orders).values({
                userId: user.id,

                status: "awaiting_payment",   // explícito — não depende do default do banco

                /* Valores */
                subtotal,
                shippingPrice,
                discount,
                total,

                /* Snapshot do cliente */
                customerName,
                customerEmail,
                customerPhone: customerPhone || null,
                customerDocument: customerDocument || null,

                /* Endereço */
                cep: cart.shippingZipcode ?? "",
                address,
                number,
                complement: complement || null,
                neighborhood: neighborhood || null,
                city,
                state,
                country: "BR",

                /* Frete */
                shippingMethod: cart.shippingMethod ?? null,
            }).returning();

            newOrderId = newOrder.id;

            // 2. Criar os itens do pedido
            await tx.insert(orderItems).values(
                cart.items.map(item => ({
                    orderId: newOrder.id,
                    productId: item.productId,
                    productTitle: item.product.title,
                    productSlug: item.product.slug ?? null,
                    productImage: null,
                    unitPrice: item.product.price,
                    quantity: item.quantity,
                    totalPrice: item.product.price * item.quantity,
                }))
            );

            // 3. Limpar o carrinho
            await tx.delete(carts).where(eq(carts.id, cart.id));
        });
    } catch (error) {
        console.error("Erro ao finalizar pedido:", error);
        return { error: "Erro ao processar o pedido. Tente novamente." };
    }

    // Redireciona para a página de pagamento com o orderId
    redirect(`/payments?orderId=${newOrderId}`);
}
