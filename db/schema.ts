import { pgTable, uuid, text, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";





export const carts = pgTable("carts", {
    id: uuid("id").defaultRandom().primaryKey(),

    sessionId: text("session_id"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    // Shipping info
    shippingZipcode: text("shipping_zipcode"),
    shippingPrice: integer("shipping_price"), // em centavos
    shippingMethod: text("shipping_method"),
    shippingDays: integer("shipping_days"),
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
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    // Dimensions for shipping
    weight: integer("weight").notNull().default(300), // em gramas
    width: integer("width").notNull().default(20),  // em cm
    height: integer("height").notNull().default(4), // em cm
    length: integer("length").notNull().default(30), // em cm
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
    images: many(product_images),
}));

export const productImagesRelations = relations(product_images, ({ one }) => ({
    product: one(products, {
        fields: [product_images.product_id],
        references: [products.id],
    }),
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

export const banners = pgTable("banners", {
    id: uuid("id").defaultRandom().primaryKey(),
    imageUrl: text("image_url").notNull(),
    title: text("title").notNull(),
    link: text("link"),
    active: boolean("active").default(true).notNull(),
    position: integer("position").default(0).notNull(),
});


export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));

export const orderStatusEnum = pgEnum("order_status", [
    "awaiting_payment",
    "paid",
    "shipped",
    "delivered",
    "cancelled",
]);


export const orders = pgTable("orders", {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id").references(() => users.id),

    status: orderStatusEnum("status")
        .notNull()
        .default("awaiting_payment"),

    /* ===== Valores ===== */
    subtotal: integer("subtotal").notNull(),
    shippingPrice: integer("shipping_price").notNull(),
    discount: integer("discount").notNull().default(0),
    total: integer("total").notNull(),

    /* ===== Dados do cliente (snapshot) ===== */
    customerName: text("customer_name"),
    customerEmail: text("customer_email"),
    customerDocument: text("customer_document"),
    customerPhone: text("customer_phone"),

    /* ===== Endereço ===== */
    cep: text("cep").notNull(),
    address: text("address").notNull(),
    number: text("number").notNull(),
    complement: text("complement"),
    neighborhood: text("neighborhood"),
    city: text("city").notNull(),
    state: text("state").notNull(),
    country: text("country").default("BR"),

    /* ===== Frete ===== */
    shippingMethod: text("shipping_method"),
    trackingCode: text("tracking_code"),
    shippedAt: timestamp("shipped_at"),
    deliveredAt: timestamp("delivered_at"),

    /* ===== Pagamento ===== */
    paymentMethod: text("payment_method"),
    paymentGateway: text("payment_gateway"),
    paymentGatewayId: text("payment_gateway_id"),
    paidAt: timestamp("paid_at"),

    /* ===== Controle ===== */
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});
export const orderItems = pgTable("order_items", {
    id: uuid("id").primaryKey().defaultRandom(),

    orderId: uuid("order_id")
        .notNull()
        .references(() => orders.id, { onDelete: "cascade" }),

    /* referência apenas informativa */
    productId: uuid("product_id").references(() => products.id, {
        onDelete: "set null",
    }),

    /* snapshot do produto */
    productTitle: text("product_title").notNull(),
    productSlug: text("product_slug"),
    productImage: text("product_image"),

    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    totalPrice: integer("total_price").notNull(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
    user: one(users, {
        fields: [orders.userId],
        references: [users.id],
    }),
    items: many(orderItems),
    payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
    product: one(products, {
        fields: [orderItems.productId],
        references: [products.id],
    }),
}));

export const usersRelations = relations(users, ({ many }) => ({
    orders: many(orders),
    sessions: many(sessions),
}));
// ENUMS
export const paymentStatusEnum = pgEnum("payment_status", [
    "pending",
    "awaiting_payment",
    "paid",
    "failed",
    "refunded",
    "cancelled",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
    "pix",
    "credit_card",
    "boleto",
]);

export const payments = pgTable("payments", {
    id: uuid("id").primaryKey().defaultRandom(),

    orderId: uuid("order_id")
        .notNull()
        .references(() => orders.id, { onDelete: "cascade" }),

    gateway: text("gateway").notNull(), // mercado_pago
    gatewayPaymentId: text("gateway_payment_id").unique(),

    method: paymentMethodEnum("method").notNull(),
    status: paymentStatusEnum("status").notNull().default("pending"),

    amount: integer("amount").notNull(),

    // PIX
    pixQrCode: text("pix_qr_code"),
    pixQrCodeBase64: text("pix_qr_code_base64"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
    order: one(orders, {
        fields: [payments.orderId],
        references: [orders.id],
    }),
}));
