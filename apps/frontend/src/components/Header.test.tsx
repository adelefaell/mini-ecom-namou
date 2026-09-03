import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"
import Header from "./Header"
import { AuthProvider } from "@/hooks/use-auth"

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<Header />} />
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

describe("Header", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("opens the cart sheet from the cart icon", async () => {
    stubAuthedFetch({
      "/api/auth/me": async () => ({ id: 1, email: "demo@mini-ecom.dev", name: "Demo User" }),
      "/api/cart": async () => ({ items: [], total: 0 }),
      "/api/wishlist": async () => ({ items: [] }),
    })
    const user = userEvent.setup()
    renderWithProviders()

    await user.click(await screen.findByRole("button", { name: /Cart/ }))
    expect(await screen.findByRole("button", { name: "Continue Shopping" })).toBeInTheDocument()
  })
})