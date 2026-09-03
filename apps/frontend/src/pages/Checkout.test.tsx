import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"
import Checkout from "./Checkout"
import { AuthProvider } from "@/hooks/use-auth"

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={["/checkout"]}>
          <Routes>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<div>Login page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

function stubAuthedFetch(handlers: Record<string, () => Promise<unknown>>) {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const key = `${init?.method ?? "GET"} ${url.split("?")[0]!}`
      const handler = handlers[key]
      if (!handler) {
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ error: { message: "Not found" } }),
        })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(handler()) })
    }),
  )
}

const cartPayload = {
  items: [
    {
      id: 1,
      variantId: 11,
      quantity: 2,
      variant: { id: 11, sku: "TEE-T-S", name: "Small", price: 9.99 },
      product: { id: 1, slug: "test-tee", name: "Test Tee", imageUrl: "https://example.com/tee.jpg" },
    },
  ],
  total: 19.98,
}

const orderPayload = {
  id: 42,
  total: 19.98,
  createdAt: "2026-09-03T00:00:00.000Z",
  items: [
    {
      id: 1,
      variantId: 11,
      quantity: 2,
      unitPrice: 9.99,
      productName: "Test Tee",
      variantName: "Small",
      imageUrl: "https://example.com/tee.jpg",
    },
  ],
}

describe("Checkout", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("redirects to login when unauthenticated", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: { message: "Authentication required" } }),
        }),
      ),
    )
    renderWithProviders()
    expect(await screen.findByText("Login page")).toBeInTheDocument()
  })

  it("shows a cart review before confirming", async () => {
    stubAuthedFetch({
      "GET /api/auth/me": async () => ({ id: 1, email: "demo@mini-ecom.dev", name: "Demo User" }),
      "GET /api/cart": async () => cartPayload,
    })
    renderWithProviders()
    expect(await screen.findByText("Test Tee")).toBeInTheDocument()
    expect(screen.getByText("Checkout")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Place order" })).toBeInTheDocument()
    expect(screen.getAllByText("$19.98")).toHaveLength(3)
  })

  it("places an order and shows the confirmation summary", async () => {
    stubAuthedFetch({
      "GET /api/auth/me": async () => ({ id: 1, email: "demo@mini-ecom.dev", name: "Demo User" }),
      "GET /api/cart": async () => cartPayload,
      "POST /api/orders": async () => orderPayload,
    })
    const user = userEvent.setup()
    renderWithProviders()
    const placeButton = await screen.findByRole("button", { name: "Place order" })
    await user.click(placeButton)

    expect(await screen.findByText("Order confirmed")).toBeInTheDocument()
    expect(screen.getByText("Order #42 — thank you!")).toBeInTheDocument()
    expect(screen.getByText("Test Tee")).toBeInTheDocument()
    expect(screen.getAllByText("$19.98")).toHaveLength(2)
  })

  it("shows an empty cart message", async () => {
    stubAuthedFetch({
      "GET /api/auth/me": async () => ({ id: 1, email: "demo@mini-ecom.dev", name: "Demo User" }),
      "GET /api/cart": async () => ({ items: [], total: 0 }),
    })
    renderWithProviders()
    expect(await screen.findByText("Your cart is empty")).toBeInTheDocument()
  })
})