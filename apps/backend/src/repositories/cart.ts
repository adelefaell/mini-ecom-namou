import { db } from "../db/client"
import { cartItems, variants, products } from "../db/schema"
import { and, asc, eq } from "drizzle-orm"
import type { CartDto } from "@repo/shared-types"

export async function getCart(userId: number): Promise<CartDto> {
  const rows = db
    .select({
      cartItem: cartItems,
      variant: variants,
      product: products,
    })
    .from(cartItems)
    .innerJoin(variants, eq(variants.id, cartItems.variantId))
    .innerJoin(products, eq(products.id, variants.productId))
    .where(eq(cartItems.userId, userId))
    .orderBy(asc(cartItems.id))
    .all()

  const items = rows.map((row) => ({
    id: row.cartItem.id,
    variantId: row.cartItem.variantId,
    quantity: row.cartItem.quantity,
    variant: {
      id: row.variant.id,
      sku: row.variant.sku,
      name: row.variant.name,
      price: row.variant.price,
    },
    product: {
      id: row.product.id,
      slug: row.product.slug,
      name: row.product.name,
      imageUrl: row.product.imageUrl,
    },
  }))

  const total = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0)
  return { items, total }
}

export async function addItem(userId: number, variantId: number, quantity: number) {
  const existing = db
    .select({ id: cartItems.id })
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.variantId, variantId)))
    .get()

  if (existing) {
    await db
      .update(cartItems)
      .set({ quantity: quantity })
      .where(eq(cartItems.id, existing.id))
  } else {
    await db.insert(cartItems).values({ userId, variantId, quantity }).run()
  }
}

export async function updateItem(userId: number, itemId: number, patch: { quantity?: number; variantId?: number }) {
  const result = await db
    .update(cartItems)
    .set(patch)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)))
    .run()
  return result.changes > 0
}

export async function removeItem(userId: number, itemId: number) {
  const result = await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)))
    .run()
  return result.changes > 0
}