import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core"

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
})

export const variants = sqliteTable("variants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  stock: integer("stock").notNull().default(0),
})

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type Variant = typeof variants.$inferSelect
export type NewVariant = typeof variants.$inferInsert