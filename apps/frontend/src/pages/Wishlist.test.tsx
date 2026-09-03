import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"
import Wishlist from "./Wishlist"
import { AuthProvider } from "@/hooks/use-auth"

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={["/wishlist"]}>
          <Routes>
            <Route path="/wishlist" element={<Wishlist />} />
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

const wishlistPayload = {
  items: [
    {
      id: 1,
      variantId: 11,
      variant: { id: 11, sku: "TEE-T-S", name: "Small", price: 9.99 },
      product: { id: 1, slug: "test-tee", name: "Test Tee", imageUrl: "https://example.com/tee.jpg" },
    },
  ],
}

const authedHandlers = (overrides: Record<string, () => Promise<unknown>> = {}) => ({
  "/api/auth/me": async () => ({ id: 1, email: "demo@mini-ecom.dev", name: "Demo User" }),
  "/api/wishlist": async () => wishlistPayload,
  ...overrides,
})

describe("Wishlist", () => {
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

  it("lists wishlist items", async () => {
    stubAuthedFetch(authedHandlers())
    renderWithProviders()
    expect(await screen.findByText("Test Tee")).toBeInTheDocument()
    expect(screen.getByText("Small — $9.99")).toBeInTheDocument()
  })

  it("shows an empty wishlist message", async () => {
    stubAuthedFetch(authedHandlers({ "/api/wishlist": async () => ({ items: [] }) }))
    renderWithProviders()
    expect(await screen.findByText("Your wishlist is empty")).toBeInTheDocument()
  })

  it("removes an item", async () => {
    stubAuthedFetch(
      authedHandlers({
        "/api/wishlist/items/1": async () => ({ items: [] }),
      }),
    )
    const user = userEvent.setup()
    renderWithProviders()
    const removeButton = await screen.findByRole("button", { name: "Remove Test Tee" })
    await user.click(removeButton)
    expect(await screen.findByText("Your wishlist is empty")).toBeInTheDocument()
  })

  it("moves an item to the cart", async () => {
    stubAuthedFetch(
      authedHandlers({
        "/api/wishlist/items/1/move-to-cart": async () => ({
          cart: {
            items: [
              {
                id: 1,
                variantId: 11,
                quantity: 1,
                variant: { id: 11, sku: "TEE-T-S", name: "Small", price: 9.99 },
                product: { id: 1, slug: "test-tee", name: "Test Tee", imageUrl: "https://example.com/tee.jpg" },
              },
            ],
            total: 9.99,
          },
          wishlist: { items: [] },
        }),
      }),
    )
    const user = userEvent.setup()
    renderWithProviders()
    const moveButton = await screen.findByRole("button", { name: "Move to cart" })
    await user.click(moveButton)
    expect(await screen.findByText("Your wishlist is empty")).toBeInTheDocument()
  })
})