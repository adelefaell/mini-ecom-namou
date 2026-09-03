import { describe, expect, it } from "vitest"
import { buildApp } from "./app"

describe("app", () => {
  it("serves a health check", async () => {
    const app = buildApp()
    const res = await app.inject({ method: "GET", url: "/api/health" })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ status: "ok" })
    await app.close()
  })

  it("serves a root health check", async () => {
    const app = buildApp()
    const res = await app.inject({ method: "GET", url: "/health" })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ status: "ok" })
    await app.close()
  })
})