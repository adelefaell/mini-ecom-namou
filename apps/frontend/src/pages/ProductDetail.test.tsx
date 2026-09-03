import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"
import ProductDetail from "./ProductDetail"
import { AuthProvider } from "@/hooks/use-auth"

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={["/products/1"]}>
          <Routes>
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login" element={<div>Login page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

function stubFetch(handlers: Record<string, () => Promise<unknown>>, logCalls: unknown[] | null = null) {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const method = init?.method ?? "GET"
      const key = `${method} ${url.split("?")[0]!}`
      if (logCalls) logCalls.push(key)
      const handler = handlers[key]
      if (!handler) return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ error: { message: "Not found" } }) })
      return Promise.resolve({ ok: true, json: () => Promise.resolve(handler()) })
    }),
  )
}

const product = {
  id: 1,
  slug: "test-tee",
  name: "Test Tee",
  description: "A test product",
  imageUrl: "https://example.com/tee.jpg",
  variants: [
    { id: 11, productId: 1, sku: "TEE-T-S", name: "Small", price: 9.99, stock: 5 },
  ],
}

function authedHandlers() {
  let stock = 5
  let items: {
    id: number
    variantId: number
    quantity: number
    variant: { id: number; sku: string; name: string; price: number }
    product: { id: number; slug: string; name: string; imageUrl: string }
  }[] = []
  const cart = () => ({
    items,
    total: items.reduce((s, i) => s + i.variant.price * i.quantity, 0),
  })
  return {
    "GET /api/auth/me": async () => ({ id: 1, email: "demo@mini-ecom.dev", name: "Demo User" }),
    "GET /api/products/1": async () => ({ ...product, variants: [{ ...product.variants[0], stock }] }),
    "GET /api/cart": async () => cart(),
    "GET /api/wishlist": async () => ({ items: [] }),
    "POST /api/cart/items": async () => {
      stock -= 1
      const v = product.variants[0]!
      items = [
        {
          id: 1,
          variantId: 11,
          quantity: 1,
          variant: { id: v.id, sku: v.sku, name: v.name, price: v.price },
          product,
        },
      ]
      return cart()
    },
  }
}

describe("ProductDetail", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("increments the cart on double-click and decrements displayed stock", async () => {
    const calls: unknown[] = []
    stubFetch(authedHandlers(), calls)
    const user = userEvent.setup()
    renderWithProviders()

    expect(await screen.findByText("5 in stock")).toBeInTheDocument()

    await user.dblClick(screen.getByRole("button", { name: "Add to cart" }))

    const adds = calls.filter((c) => c === "POST /api/cart/items")
    expect(adds).toHaveLength(2)

    await user.click(await screen.findByRole("button", { name: "Continue Shopping" }))
    expect(await screen.findByText("3 in stock")).toBeInTheDocument()
  })

  it("opens the sheet on the first add to an empty cart but not on later adds", async () => {
    const calls: unknown[] = []
    stubFetch(authedHandlers(), calls)
    const user = userEvent.setup()
    renderWithProviders()

    expect(await screen.findByText("5 in stock")).toBeInTheDocument()
    const button = screen.getByRole("button", { name: "Add to cart" })

    await user.click(button)
    expect(await screen.findByRole("button", { name: "Continue Shopping" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Continue Shopping" }))

    await user.click(button)
    expect(screen.queryByRole("button", { name: "Continue Shopping" })).not.toBeInTheDocument()

    const adds = calls.filter((c) => c === "POST /api/cart/items")
    expect(adds).toHaveLength(2)
  })

  it("disables the button and shows Out of stock when stock reaches zero", async () => {
    const handlers = authedHandlers()
    let stock = 1
    handlers["GET /api/products/1"] = async () => ({
      ...product,
      variants: [{ ...product.variants[0], stock }],
    })
    handlers["POST /api/cart/items"] = async () => {
      stock -= 1
      return { items: [], total: 0 }
    }
    stubFetch(handlers)
    const user = userEvent.setup()
    renderWithProviders()

    expect(await screen.findByText("1 in stock")).toBeInTheDocument()
    const button = screen.getByRole("button", { name: "Add to cart" })

    await user.click(button)
    await user.click(await screen.findByRole("button", { name: "Continue Shopping" }))
    expect(screen.getByRole("button", { name: "Out of stock" })).toBeDisabled()
  })

  it("redirects a guest to login when clicking add to cart", async () => {
    stubFetch({
      "GET /api/products/1": async () => product,
      "GET /api/auth/me": async () => {
        throw new Error("unauthenticated")
      },
    })
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes("/api/products")) {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(product) })
        }
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: { message: "Authentication required" } }),
        })
      }),
    )
    const user = userEvent.setup()
    renderWithProviders()
    const button = await screen.findByRole("button", { name: "Sign in to add to cart" })
    await user.click(button)
    expect(await screen.findByText("Login page")).toBeInTheDocument()
  })
})