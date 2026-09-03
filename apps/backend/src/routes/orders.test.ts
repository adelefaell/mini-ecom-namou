import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { hashSync } from "bcryptjs"
import { db } from "../db/client"
import { cartItems, orderItems, orders, products, users, variants } from "../db/schema"
import { buildApp } from "../app"
import type { FastifyInstance } from "fastify"

async function resetDb() {
  db.delete(orderItems).run()
  db.delete(orders).run()
  db.delete(cartItems).run()
  db.delete(variants).run()
  db.delete(products).run()
  db.delete(users).run()
}

describe("orders", () => {
  let app: FastifyInstance
  let teeVariantId: number
  let hoodieVariantId: number
  let cookie: string

  beforeAll(async () => {
    migrate(db, { migrationsFolder: "./drizzle" })
    app = buildApp()
    await resetDb()

    db.insert(users)
      .values({
        email: "demo@mini-ecom.dev",
        name: "Demo User",
        passwordHash: hashSync("demo-password", 10),
      })
      .run()

    const tee = db
      .insert(products)
      .values({
        slug: "test-tee",
        name: "Test Tee",
        description: "A test product",
        imageUrl: "https://example.com/tee.jpg",
      })
      .returning({ id: products.id })
      .get()
    const hoodie = db
      .insert(products)
      .values({
        slug: "test-hoodie",
        name: "Test Hoodie",
        description: "A test product",
        imageUrl: "https://example.com/hoodie.jpg",
      })
      .returning({ id: products.id })
      .get()

    const teeVariant = db
      .insert(variants)
      .values({ productId: tee.id, sku: "TEE-T-S", name: "Small", price: 9.99, stock: 5 })
      .returning({ id: variants.id })
      .get()
    teeVariantId = teeVariant.id
    const hoodieVariant = db
      .insert(variants)
      .values({ productId: hoodie.id, sku: "HDY-T-M", name: "Medium", price: 49.99, stock: 3 })
      .returning({ id: variants.id })
      .get()
    hoodieVariantId = hoodieVariant.id

    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "demo@mini-ecom.dev", password: "demo-password" },
    })
    cookie = `session=${login.cookies[0]?.value}`
  })

  afterAll(async () => {
    await app.close()
  })

  it("rejects order creation without a session", async () => {
    const res = await app.inject({ method: "POST", url: "/api/orders" })
    expect(res.statusCode).toBe(401)
  })

  it("rejects placing an order with an empty cart", async () => {
    const res = await app.inject({ method: "POST", url: "/api/orders", headers: { cookie } })
    expect(res.statusCode).toBe(400)
    expect(res.json()).toEqual({ error: { message: "Cart is empty" } })
  })

  it("creates an order with line items and clears the cart", async () => {
    await app.inject({
      method: "POST",
      url: "/api/cart/items",
      headers: { cookie },
      payload: { variantId: teeVariantId, quantity: 2 },
    })
    await app.inject({
      method: "POST",
      url: "/api/cart/items",
      headers: { cookie },
      payload: { variantId: hoodieVariantId, quantity: 1 },
    })

    const res = await app.inject({ method: "POST", url: "/api/orders", headers: { cookie } })
    expect(res.statusCode).toBe(201)
    const order = res.json()
    expect(order.total).toBe(69.97)
    expect(order.items).toHaveLength(2)
    expect(order.items[0]).toMatchObject({
      variantId: teeVariantId,
      quantity: 2,
      unitPrice: 9.99,
      productName: "Test Tee",
      variantName: "Small",
    })
    expect(order.items[1]).toMatchObject({
      variantId: hoodieVariantId,
      quantity: 1,
      unitPrice: 49.99,
      productName: "Test Hoodie",
    })
    expect(typeof order.createdAt).toBe("string")

    const cart = await app.inject({ method: "GET", url: "/api/cart", headers: { cookie } })
    expect(cart.json()).toEqual({ items: [], total: 0 })

    const rowCount = db.select({ id: orders.id }).from(orders).all().length
    const itemCount = db.select({ id: orderItems.id }).from(orderItems).all().length
    expect(rowCount).toBe(1)
    expect(itemCount).toBe(2)
  })
})