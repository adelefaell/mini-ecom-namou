import { db } from "../db/client"
import { cartItems, orderItems, orders, products, variants } from "../db/schema"
import { asc, eq } from "drizzle-orm"
import type { OrderDto } from "@repo/shared-types"

export function getOrderById(id: number): OrderDto | null {
  const rows = db
    .select()
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(eq(orders.id, id))
    .orderBy(asc(orderItems.id))
    .all()

  if (rows.length === 0) return null
  const order = rows[0]!.orders
  return {
    id: order.id,
    total: order.total,
    createdAt: order.createdAt,
    items: rows.map((row) => ({
      id: row.order_items.id,
      variantId: row.order_items.variantId,
      quantity: row.order_items.quantity,
      unitPrice: row.order_items.unitPrice,
      productName: row.order_items.productName,
      variantName: row.order_items.variantName,
      imageUrl: row.order_items.imageUrl,
    })),
  }
}

export class EmptyCartError extends Error {
  constructor(message = "Cart is empty") {
    super(message)
  }
}

export function placeOrder(userId: number): OrderDto {
  const orderId = db.transaction((tx) => {
    const cart = tx
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

    if (cart.length === 0) {
      throw new EmptyCartError()
    }

    const total = cart.reduce((sum, row) => sum + row.variant.price * row.cartItem.quantity, 0)

    const inserted = tx
      .insert(orders)
      .values({ userId, total })
      .returning({ id: orders.id })
      .get()

    tx.insert(orderItems)
      .values(
        cart.map((row) => ({
          orderId: inserted.id,
          variantId: row.cartItem.variantId,
          quantity: row.cartItem.quantity,
          unitPrice: row.variant.price,
          productName: row.product.name,
          variantName: row.variant.name,
          imageUrl: row.product.imageUrl,
        })),
      )
      .run()

    tx.delete(cartItems).where(eq(cartItems.userId, userId)).run()

    return inserted.id
  })

  return getOrderById(orderId)!
}