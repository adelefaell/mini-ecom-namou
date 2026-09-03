import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { hashSync } from "bcryptjs"
import { db } from "../db/client"
import { users } from "../db/schema"
import { buildApp } from "../app"
import type { FastifyInstance } from "fastify"

async function resetDb() {
  db.delete(users).run()
}

async function seedUser() {
  const inserted = db
    .insert(users)
    .values({
      email: "demo@mini-ecom.dev",
      name: "Demo User",
      passwordHash: hashSync("demo-password", 10),
    })
    .returning({ id: users.id })
    .get()
  return inserted.id
}

describe("auth", () => {
  let app: FastifyInstance

  beforeAll(async () => {
    migrate(db, { migrationsFolder: "./drizzle" })
    app = buildApp()
    await resetDb()
    await seedUser()
  })

  afterAll(async () => {
    await app.close()
  })

  it("rejects login with bad credentials", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "demo@mini-ecom.dev", password: "wrong-password" },
    })
    expect(res.statusCode).toBe(401)
    expect(res.json()).toEqual({ error: { message: "Invalid email or password" } })
  })

  it("rejects login with unknown email", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "nobody@mini-ecom.dev", password: "demo-password" },
    })
    expect(res.statusCode).toBe(401)
  })

  it("rejects login with invalid body", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "not-an-email", password: "" },
    })
    expect(res.statusCode).toBe(400)
  })

  it("logs in and returns the user with an httpOnly session cookie", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "demo@mini-ecom.dev", password: "demo-password" },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({ email: "demo@mini-ecom.dev", name: "Demo User" })

    const setCookie = res.headers["set-cookie"] as string | undefined
    expect(setCookie).toBeDefined()
    expect(setCookie).toContain("session=")
    expect(setCookie).toContain("HttpOnly")
    expect(setCookie).toContain("SameSite=Lax")
  })

  it("returns the current user from /me when authenticated", async () => {
    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "demo@mini-ecom.dev", password: "demo-password" },
    })
    const cookie = `session=${login.cookies[0]?.value}`

    const res = await app.inject({
      method: "GET",
      url: "/api/auth/me",
      headers: { cookie },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({ email: "demo@mini-ecom.dev", name: "Demo User" })
  })

  it("rejects /me without a session cookie", async () => {
    const res = await app.inject({ method: "GET", url: "/api/auth/me" })
    expect(res.statusCode).toBe(401)
    expect(res.json()).toEqual({ error: { message: "Authentication required" } })
  })

  it("rejects /me with an invalid session cookie", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/auth/me",
      headers: { cookie: "session=not-a-real-token" },
    })
    expect(res.statusCode).toBe(401)
  })

  it("logs out and clears the session cookie", async () => {
    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "demo@mini-ecom.dev", password: "demo-password" },
    })
    const cookie = `session=${login.cookies[0]?.value}`

    const res = await app.inject({
      method: "POST",
      url: "/api/auth/logout",
      headers: { cookie },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ ok: true })
    const setCookie = res.headers["set-cookie"] as string | undefined
    expect(setCookie).toContain("session=;")
    expect(setCookie).toContain("Max-Age=0")
  })
})