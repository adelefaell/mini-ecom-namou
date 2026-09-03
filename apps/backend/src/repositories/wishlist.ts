import { db } from "../db/client"
import { wishlistItems, variants, products } from "../db/schema"
import { and, asc, eq } from "drizzle-orm"
import type { WishlistDto } from "@repo/shared-types"

export async function getWishlist(userId: number): Promise<WishlistDto> {
  const rows = db
    .select({
      wishlistItem: wishlistItems,
      variant: variants,
      product: products,
    })
    .from(wishlistItems)
    .innerJoin(variants, eq(variants.id, wishlistItems.variantId))
    .innerJoin(products, eq(products.id, variants.productId))
    .where(eq(wishlistItems.userId, userId))
    .orderBy(asc(wishlistItems.id))
    .all()

  return {
    items: rows.map((row) => ({
      id: row.wishlistItem.id,
      variantId: row.wishlistItem.variantId,
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
    })),
  }
}

export async function addItem(userId: number, variantId: number) {
  const existing = db
    .select({ id: wishlistItems.id })
    .from(wishlistItems)
    .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.variantId, variantId)))
    .get()

  if (!existing) {
    await db.insert(wishlistItems).values({ userId, variantId }).run()
  }
}

export async function removeItem(userId: number, itemId: number) {
  const result = await db
    .delete(wishlistItems)
    .where(and(eq(wishlistItems.id, itemId), eq(wishlistItems.userId, userId)))
    .run()
  return result.changes > 0
}

export async function removeByVariant(userId: number, variantId: number) {
  await db
    .delete(wishlistItems)
    .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.variantId, variantId)))
    .run()
}