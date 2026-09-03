import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { hashSync } from "bcryptjs"
import { db } from "../db/client"
import { cartItems, orderItems, orders, products, users, variants, wishlistItems } from "../db/schema"
import { buildApp } from "../app"
import type { FastifyInstance } from "fastify"

async function resetDb() {
  db.delete(orderItems).run()
  db.delete(orders).run()
  db.delete(wishlistItems).run()
  db.delete(cartItems).run()
  db.delete(variants).run()
  db.delete(products).run()
  db.delete(users).run()
}

describe("wishlist", () => {
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

  it("rejects wishlist access without a session", async () => {
    const res = await app.inject({ method: "GET", url: "/api/wishlist" })
    expect(res.statusCode).toBe(401)
  })

  it("starts with an empty wishlist", async () => {
    const res = await app.inject({ method: "GET", url: "/api/wishlist", headers: { cookie } })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ items: [] })
  })

  it("adds an item to the wishlist", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/wishlist/items",
      headers: { cookie },
      payload: { variantId: teeVariantId },
    })
    expect(res.statusCode).toBe(201)
    const body = res.json()
    expect(body.items).toHaveLength(1)
    expect(body.items[0]).toMatchObject({
      variantId: teeVariantId,
      variant: { sku: "TEE-T-S", price: 9.99 },
      product: { slug: "test-tee" },
    })
  })

  it("does not duplicate an existing wishlist item", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/wishlist/items",
      headers: { cookie },
      payload: { variantId: teeVariantId },
    })
    expect(res.statusCode).toBe(201)
    expect(res.json().items).toHaveLength(1)
  })

  it("adds a second item", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/wishlist/items",
      headers: { cookie },
      payload: { variantId: hoodieVariantId },
    })
    expect(res.statusCode).toBe(201)
    expect(res.json().items).toHaveLength(2)
  })

  it("moves an item to the cart and removes it from the wishlist", async () => {
    const wishlist = await app.inject({ method: "GET", url: "/api/wishlist", headers: { cookie } })
    const itemId = wishlist.json().items[0].id

    const res = await app.inject({
      method: "POST",
      url: `/api/wishlist/items/${itemId}/move-to-cart`,
      headers: { cookie },
    })
    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.wishlist.items).toHaveLength(1)
    expect(body.cart.items).toHaveLength(1)
    expect(body.cart.items[0].variantId).toBe(teeVariantId)
    expect(body.cart.items[0].quantity).toBe(1)
  })

  it("removes an item", async () => {
    const wishlist = await app.inject({ method: "GET", url: "/api/wishlist", headers: { cookie } })
    const itemId = wishlist.json().items[0].id

    const res = await app.inject({
      method: "DELETE",
      url: `/api/wishlist/items/${itemId}`,
      headers: { cookie },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().items).toHaveLength(0)
  })

  it("returns 404 when moving a missing item to cart", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/wishlist/items/9999/move-to-cart",
      headers: { cookie },
    })
    expect(res.statusCode).toBe(404)
  })
})