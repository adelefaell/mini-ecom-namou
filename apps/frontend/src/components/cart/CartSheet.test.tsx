import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"
import { CartSheet } from "./CartSheet"
import { AuthProvider } from "@/hooks/use-auth"

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={ui} />
            <Route path="/cart" element={<div>Cart page</div>} />
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

describe("CartSheet", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("shows the added confirmation and cart items", async () => {
    stubAuthedFetch({
      "/api/auth/me": async () => ({ id: 1, email: "demo@mini-ecom.dev", name: "Demo User" }),
      "/api/cart": async () => cartPayload,
    })
    renderWithProviders(
      <CartSheet open onOpenChange={vi.fn()} justAddedName="Test Tee" />,
    )
    expect(await screen.findByText("Added to Test Tee!")).toBeInTheDocument()
    expect(await screen.findByText("Test Tee")).toBeInTheDocument()
    expect(screen.getByText("Small — $9.99")).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument()
    expect(screen.getAllByText("$19.98")).toHaveLength(2)
  })

  it("updates quantity from the stepper", async () => {
    stubAuthedFetch({
      "/api/auth/me": async () => ({ id: 1, email: "demo@mini-ecom.dev", name: "Demo User" }),
      "/api/cart": async () => cartPayload,
      "/api/cart/items/1": async () => ({
        items: [{ ...cartPayload.items[0], quantity: 3 }],
        total: 29.97,
      }),
    })
    const user = userEvent.setup()
    renderWithProviders(<CartSheet open onOpenChange={vi.fn()} />)
    await user.click(await screen.findByRole("button", { name: "Increase quantity of Test Tee" }))
    expect(await screen.findByText("3")).toBeInTheDocument()
  })

  it("removes an item directly when its quantity is one", async () => {
    stubAuthedFetch({
      "/api/auth/me": async () => ({ id: 1, email: "demo@mini-ecom.dev", name: "Demo User" }),
      "/api/cart": async () => ({
        items: [{ ...cartPayload.items[0]!, quantity: 1 }],
        total: 9.99,
      }),
      "/api/cart/items/1": async () => ({ items: [], total: 0 }),
    })
    const user = userEvent.setup()
    renderWithProviders(<CartSheet open onOpenChange={vi.fn()} />)
    await user.click(await screen.findByRole("button", { name: "Remove Test Tee" }))
    expect(await screen.findByText("Nothing here yet — keep browsing.")).toBeInTheDocument()
  })

  it("confirms removal via alert dialog when the item quantity is more than one", async () => {
    stubAuthedFetch({
      "/api/auth/me": async () => ({ id: 1, email: "demo@mini-ecom.dev", name: "Demo User" }),
      "/api/cart": async () => cartPayload,
      "/api/cart/items/1": async () => ({ items: [], total: 0 }),
    })
    const user = userEvent.setup()
    renderWithProviders(<CartSheet open onOpenChange={vi.fn()} />)
    await user.click(await screen.findByRole("button", { name: "Remove Test Tee" }))
    expect(await screen.findByText("Remove item?")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Remove" }))
    expect(await screen.findByText("Nothing here yet — keep browsing.")).toBeInTheDocument()
  })

  it("navigates to the cart page via View Cart", async () => {
    stubAuthedFetch({
      "/api/auth/me": async () => ({ id: 1, email: "demo@mini-ecom.dev", name: "Demo User" }),
      "/api/cart": async () => cartPayload,
    })
    const user = userEvent.setup()
    renderWithProviders(<CartSheet open onOpenChange={vi.fn()} />)
    await user.click(await screen.findByRole("link", { name: "View Cart →" }))
    expect(await screen.findByText("Cart page")).toBeInTheDocument()
  })

  it("closes via Continue Shopping", async () => {
    stubAuthedFetch({
      "/api/auth/me": async () => ({ id: 1, email: "demo@mini-ecom.dev", name: "Demo User" }),
      "/api/cart": async () => cartPayload,
    })
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<CartSheet open onOpenChange={onOpenChange} />)
    await user.click(await screen.findByRole("button", { name: "Continue Shopping" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})