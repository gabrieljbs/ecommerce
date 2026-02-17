import { pgTable, uuid, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";





export const carts = pgTable("carts", {
    id: uuid("id").defaultRandom().primaryKey(),

    sessionId: text("session_id"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cartsRelations = relations(carts, ({ many }) => ({
    items: many(cart_items),
}));

export const cart_items = pgTable("cart_items", {
    id: uuid("id").defaultRandom().primaryKey(),

    cartId: uuid("cart_id").notNull(),
    productId: uuid("product_id").notNull(),

    quantity: integer("quantity").notNull().default(1),
});


export const products = pgTable("products", {
    id: uuid("id").defaultRandom().primaryKey(),

    title: text("title").notNull(),
    description: text("description"),
    price: integer("price").notNull(),

    slug: text("slug").notNull(),
});

export const product_images = pgTable("product_images", {
    id: uuid("id").primaryKey().defaultRandom(),
    product_id: uuid("product_id").references(() => products.id),
    url: text("url"),
    alt: text("alt"),
    is_main: boolean("is_main").default(false),
    position: integer("position").default(0),
});

export const productRelations = relations(products, ({ many }) => ({
    images: many(product_images, { relationName: "product_id" }),
}));

export const cartItemsRelations = relations(cart_items, ({ one }) => ({
    product: one(products, {
        fields: [cart_items.productId],
        references: [products.id],
    }),
    cart: one(carts, {
        fields: [cart_items.cartId],
        references: [carts.id],
    }),
}));
