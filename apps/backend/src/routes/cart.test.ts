import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { hashSync } from "bcryptjs"
import { db } from "../db/client"
import { cartItems, products, users, variants } from "../db/schema"
import { buildApp } from "../app"
import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"

async function resetDb() {
  db.delete(cartItems).run()
  db.delete(variants).run()
  db.delete(products).run()
  db.delete(users).run()
}

describe("cart", () => {
  let app: FastifyInstance
  let teeVariantId: number
  let teeLargeVariantId: number
  let hoodieVariantId: number
  let socksVariantId: number
  let capVariantId: number
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
    const teeLargeVariant = db
      .insert(variants)
      .values({ productId: tee.id, sku: "TEE-T-L", name: "Large", price: 11.49, stock: 3 })
      .returning({ id: variants.id })
      .get()
    teeLargeVariantId = teeLargeVariant.id
    const hoodieVariant = db
      .insert(variants)
      .values({ productId: hoodie.id, sku: "HDY-T-M", name: "Medium", price: 49.99, stock: 3 })
      .returning({ id: variants.id })
      .get()
    hoodieVariantId = hoodieVariant.id

    const socks = db
      .insert(products)
      .values({
        slug: "test-socks",
        name: "Test Socks",
        description: "A test product",
        imageUrl: "https://example.com/socks.jpg",
      })
      .returning({ id: products.id })
      .get()
    const socksVariant = db
      .insert(variants)
      .values({ productId: socks.id, sku: "SCK-T", name: "One Size", price: 4.99, stock: 10 })
      .returning({ id: variants.id })
      .get()
    socksVariantId = socksVariant.id

    const cap = db
      .insert(products)
      .values({
        slug: "test-cap",
        name: "Test Cap",
        description: "A test product",
        imageUrl: "https://example.com/cap.jpg",
      })
      .returning({ id: products.id })
      .get()
    const capVariant = db
      .insert(variants)
      .values({ productId: cap.id, sku: "CAP-OS", name: "One Size", price: 12.99, stock: 1 })
      .returning({ id: variants.id })
      .get()
    capVariantId = capVariant.id

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

  it("rejects cart access without a session", async () => {
    const res = await app.inject({ method: "GET", url: "/api/cart" })
    expect(res.statusCode).toBe(401)
  })

  it("starts with an empty cart", async () => {
    const res = await app.inject({ method: "GET", url: "/api/cart", headers: { cookie } })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ items: [], total: 0 })
  })

  it("adds an item to the cart", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/cart/items",
      headers: { cookie },
      payload: { variantId: teeVariantId, quantity: 2 },
    })
    expect(res.statusCode).toBe(201)
    const body = res.json()
    expect(body.items).toHaveLength(1)
    expect(body.items[0]).toMatchObject({
      variantId: teeVariantId,
      quantity: 2,
      variant: { sku: "TEE-T-S", price: 9.99 },
      product: { slug: "test-tee" },
    })
    expect(body.total).toBe(19.98)
  })

  it("adds a second item", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/cart/items",
      headers: { cookie },
      payload: { variantId: hoodieVariantId, quantity: 1 },
    })
    expect(res.statusCode).toBe(201)
    expect(res.json().items).toHaveLength(2)
    expect(res.json().total).toBe(69.97)
  })

  it("updates an item quantity", async () => {
    const cart = await app.inject({ method: "GET", url: "/api/cart", headers: { cookie } })
    const itemId = cart.json().items[0].id

    const res = await app.inject({
      method: "PATCH",
      url: `/api/cart/items/${itemId}`,
      headers: { cookie },
      payload: { quantity: 5 },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().items.find((i: { id: number }) => i.id === itemId).quantity).toBe(5)
    expect(res.json().total).toBe(99.94)
  })

  it("changes the variant of an item", async () => {
    const cart = await app.inject({ method: "GET", url: "/api/cart", headers: { cookie } })
    const itemId = cart.json().items[1].id

    const res = await app.inject({
      method: "PATCH",
      url: `/api/cart/items/${itemId}`,
      headers: { cookie },
      payload: { variantId: teeLargeVariantId },
    })
    expect(res.statusCode).toBe(200)
    const updated = res.json().items.find((i: { id: number }) => i.id === itemId)
    expect(updated.variantId).toBe(teeLargeVariantId)
    expect(updated.variant.sku).toBe("TEE-T-L")
  })

  it("removes an item", async () => {
    const cart = await app.inject({ method: "GET", url: "/api/cart", headers: { cookie } })
    const itemId = cart.json().items[0].id

    const res = await app.inject({
      method: "DELETE",
      url: `/api/cart/items/${itemId}`,
      headers: { cookie },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().items).toHaveLength(1)
  })

  it("returns 404 when updating a missing item", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/api/cart/items/9999",
      headers: { cookie },
      payload: { quantity: 3 },
    })
    expect(res.statusCode).toBe(404)
  })

  it("returns 404 when adding a missing variant", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/cart/items",
      headers: { cookie },
      payload: { variantId: 9999, quantity: 1 },
    })
    expect(res.statusCode).toBe(404)
  })

  function stockOf(variantId: number) {
    return db.select({ stock: variants.stock }).from(variants).where(eq(variants.id, variantId)).get()!.stock
  }

  it("increments an existing cart row on repeat add and decrements stock", async () => {
    const first = await app.inject({
      method: "POST",
      url: "/api/cart/items",
      headers: { cookie },
      payload: { variantId: socksVariantId, quantity: 1 },
    })
    expect(first.statusCode).toBe(201)
    expect(stockOf(socksVariantId)).toBe(9)

    const second = await app.inject({
      method: "POST",
      url: "/api/cart/items",
      headers: { cookie },
      payload: { variantId: socksVariantId, quantity: 1 },
    })
    expect(second.statusCode).toBe(201)
    const socksItem = second.json().items.find((i: { variantId: number }) => i.variantId === socksVariantId)
    expect(socksItem.quantity).toBe(2)
    expect(stockOf(socksVariantId)).toBe(8)
  })

  it("restores stock when an item is removed", async () => {
    const cart = await app.inject({ method: "GET", url: "/api/cart", headers: { cookie } })
    const socksItem = cart.json().items.find((i: { variantId: number }) => i.variantId === socksVariantId)

    const res = await app.inject({
      method: "DELETE",
      url: `/api/cart/items/${socksItem.id}`,
      headers: { cookie },
    })
    expect(res.statusCode).toBe(200)
    expect(stockOf(socksVariantId)).toBe(10)
  })

  it("restores stock when an item quantity is decreased", async () => {
    await app.inject({
      method: "POST",
      url: "/api/cart/items",
      headers: { cookie },
      payload: { variantId: socksVariantId, quantity: 3 },
    })
    expect(stockOf(socksVariantId)).toBe(7)

    const cart = await app.inject({ method: "GET", url: "/api/cart", headers: { cookie } })
    const socksItem = cart.json().items.find((i: { variantId: number }) => i.variantId === socksVariantId)

    const res = await app.inject({
      method: "PATCH",
      url: `/api/cart/items/${socksItem.id}`,
      headers: { cookie },
      payload: { quantity: 1 },
    })
    expect(res.statusCode).toBe(200)
    expect(stockOf(socksVariantId)).toBe(9)
  })

  it("returns 409 and makes no cart change when stock is insufficient", async () => {
    await app.inject({
      method: "POST",
      url: "/api/cart/items",
      headers: { cookie },
      payload: { variantId: capVariantId, quantity: 1 },
    })
    expect(stockOf(capVariantId)).toBe(0)

    const res = await app.inject({
      method: "POST",
      url: "/api/cart/items",
      headers: { cookie },
      payload: { variantId: capVariantId, quantity: 1 },
    })
    expect(res.statusCode).toBe(409)
    expect(res.json().error.message).toMatch(/stock/i)
    expect(stockOf(capVariantId)).toBe(0)
  })
})