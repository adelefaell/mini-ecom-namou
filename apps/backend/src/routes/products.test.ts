import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { db } from "../db/client"
import { products, variants } from "../db/schema"
import { buildApp } from "../app"
import type { FastifyInstance } from "fastify"

async function resetDb() {
  db.delete(variants).run()
  db.delete(products).run()
}

describe("product catalogue", () => {
  let app: FastifyInstance
  let productId: number

  beforeAll(async () => {
    migrate(db, { migrationsFolder: "./drizzle" })
    app = buildApp()

    await resetDb()
    const inserted = db
      .insert(products)
      .values({
        slug: "test-tee",
        name: "Test Tee",
        description: "A test product",
        imageUrl: "https://example.com/tee.jpg",
      })
      .returning({ id: products.id })
      .get()
    productId = inserted.id
    db.insert(variants)
      .values([
        { productId: inserted.id, sku: "TEE-T-S", name: "Small", price: 9.99, stock: 5 },
        { productId: inserted.id, sku: "TEE-T-L", name: "Large", price: 11.49, stock: 3 },
      ])
      .run()
  })

  afterAll(async () => {
    await app.close()
  })

  it("lists all products with their variants", async () => {
    const res = await app.inject({ method: "GET", url: "/api/products" })
    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body).toHaveLength(1)
    expect(body[0].name).toBe("Test Tee")
    expect(body[0].variants).toHaveLength(2)
    expect(body[0].variants[0]).toMatchObject({ sku: "TEE-T-S", price: 9.99, stock: 5 })
  })

  it("returns a single product by id", async () => {
    const res = await app.inject({ method: "GET", url: `/api/products/${productId}` })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({
      slug: "test-tee",
      name: "Test Tee",
    })
  })

  it("returns 404 for a missing product", async () => {
    const res = await app.inject({ method: "GET", url: "/api/products/9999" })
    expect(res.statusCode).toBe(404)
    expect(res.json()).toEqual({ error: { message: "Product not found" } })
  })

  it("returns 400 for an invalid id", async () => {
    const res = await app.inject({ method: "GET", url: "/api/products/abc" })
    expect(res.statusCode).toBe(400)
  })
})