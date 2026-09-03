import { db } from "../db/client"
import { cartItems, variants, products } from "../db/schema"
import { and, asc, eq, sql } from "drizzle-orm"
import type { CartDto } from "@repo/shared-types"

type Db = typeof db
type Tx = { select: Db["select"]; insert: Db["insert"]; update: Db["update"]; delete: Db["delete"] }

export class VariantNotFoundError extends Error {
  constructor(message = "Variant not found") {
    super(message)
  }
}

export class InsufficientStockError extends Error {
  constructor(message = "Not enough stock for the requested quantity") {
    super(message)
  }
}

export class CartItemNotFoundError extends Error {
  constructor(message = "Cart item not found") {
    super(message)
  }
}

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

function getVariant(tx: Tx, id: number) {
  return tx.select().from(variants).where(eq(variants.id, id)).get()
}

function addStock(tx: Tx, variantId: number, quantity: number) {
  return tx
    .update(variants)
    .set({ stock: sql`${variants.stock} + ${quantity}` })
    .where(eq(variants.id, variantId))
    .run()
}

function takeStock(tx: Tx, variantId: number, quantity: number) {
  return addStock(tx, variantId, -quantity)
}

export function addItem(userId: number, variantId: number, quantity: number) {
  return db.transaction((tx) => {
    const variant = getVariant(tx, variantId)
    if (!variant) throw new VariantNotFoundError()

    const existing = tx
      .select({ id: cartItems.id, quantity: cartItems.quantity })
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.variantId, variantId)))
      .get()

    const newQuantity = (existing?.quantity ?? 0) + quantity
    if (variant.stock < quantity) throw new InsufficientStockError()

    takeStock(tx, variantId, quantity)

    if (existing) {
      tx.update(cartItems).set({ quantity: newQuantity }).where(eq(cartItems.id, existing.id)).run()
    } else {
      tx.insert(cartItems).values({ userId, variantId, quantity }).run()
    }
  })
}

export function updateItem(
  userId: number,
  itemId: number,
  patch: { quantity?: number; variantId?: number },
) {
  return db.transaction((tx) => {
    const item = tx
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)))
      .get()
    if (!item) throw new CartItemNotFoundError()

    const currentVariant = getVariant(tx, item.variantId)
    if (!currentVariant) throw new VariantNotFoundError()

    let targetVariantId = item.variantId
    let targetVariant = currentVariant
    if (patch.variantId != null && patch.variantId !== item.variantId) {
      const next = getVariant(tx, patch.variantId)
      if (!next) throw new VariantNotFoundError()
      targetVariantId = patch.variantId
      targetVariant = next
    }

    const newQuantity = patch.quantity ?? item.quantity
    if (newQuantity < 1) {
      throw new RangeError("Quantity must be at least 1")
    }

    if (targetVariantId === item.variantId) {
      if (currentVariant.stock + item.quantity < newQuantity) {
        throw new InsufficientStockError()
      }
      tx.update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.id, item.id))
        .run()
      takeStock(tx, item.variantId, newQuantity - item.quantity)
    } else {
      if (targetVariant.stock < newQuantity) {
        throw new InsufficientStockError()
      }
      addStock(tx, currentVariant.id, item.quantity)
      takeStock(tx, targetVariantId, newQuantity)
      tx.update(cartItems)
        .set({ quantity: newQuantity, variantId: targetVariantId })
        .where(eq(cartItems.id, item.id))
        .run()
    }

    return true
  })
}

export function removeItem(userId: number, itemId: number) {
  return db.transaction((tx) => {
    const item = tx
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)))
      .get()
    if (!item) throw new CartItemNotFoundError()

    tx.delete(cartItems).where(eq(cartItems.id, item.id)).run()
    addStock(tx, item.variantId, item.quantity)
    return true
  })
}