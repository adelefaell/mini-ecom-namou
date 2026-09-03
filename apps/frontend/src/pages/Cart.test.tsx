import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"
import Cart from "./Cart"
import { AuthProvider } from "@/hooks/use-auth"

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={["/cart"]}>
          <Routes>
            <Route path="/cart" element={<Cart />} />
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
    vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      const handler = handlers[url.split("?")[0]!]
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

describe("Cart", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("redirects to login when unauthenticated", async () => {
    stubAuthedFetch({
      "/api/auth/me": async () => {
        throw new Error("unreachable")
      },
    })
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

  it("lists cart items with subtotals and total", async () => {
    stubAuthedFetch({
      "/api/auth/me": async () => ({ id: 1, email: "demo@mini-ecom.dev", name: "Demo User" }),
      "/api/cart": async () => cartPayload,
      "/api/products": async () => [],
    })
    renderWithProviders()
    expect(await screen.findByText("Test Tee")).toBeInTheDocument()
    expect(screen.getAllByText("$19.98")).toHaveLength(2)
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("shows an empty cart message", async () => {
    stubAuthedFetch({
      "/api/auth/me": async () => ({ id: 1, email: "demo@mini-ecom.dev", name: "Demo User" }),
      "/api/cart": async () => ({ items: [], total: 0 }),
      "/api/products": async () => [],
    })
    renderWithProviders()
    expect(await screen.findByText("Your cart is empty")).toBeInTheDocument()
  })

  it("updates quantity with +/- buttons", async () => {
    stubAuthedFetch({
      "/api/auth/me": async () => ({ id: 1, email: "demo@mini-ecom.dev", name: "Demo User" }),
      "/api/cart": async () => cartPayload,
      "/api/products": async () => [],
      "/api/cart/items/1": async () => ({
        items: [
          {
            ...cartPayload.items[0],
            quantity: 3,
          },
        ],
        total: 29.97,
      }),
    })
    const user = userEvent.setup()
    renderWithProviders()
    const addButton = await screen.findByRole("button", { name: "Increase quantity of Test Tee" })
    await user.click(addButton)
    expect(await screen.findByText("3")).toBeInTheDocument()
    expect(await screen.findAllByText("$29.97")).toHaveLength(2)
  })

  it("removes an item", async () => {
    stubAuthedFetch({
      "/api/auth/me": async () => ({ id: 1, email: "demo@mini-ecom.dev", name: "Demo User" }),
      "/api/cart": async () => cartPayload,
      "/api/products": async () => [],
      "/api/cart/items/1": async () => ({ items: [], total: 0 }),
    })
    const user = userEvent.setup()
    renderWithProviders()
    const removeButton = await screen.findByRole("button", { name: "Remove Test Tee" })
    await user.click(removeButton)
    expect(await screen.findByText("Your cart is empty")).toBeInTheDocument()
  })
})