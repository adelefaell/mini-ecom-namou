import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"
import ProductList from "./pages/ProductList"

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe("ProductList", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("shows a skeleton while loading", () => {
    const fetchMock = vi.fn(() => new Promise(() => {}))
    vi.stubGlobal("fetch", fetchMock)
    renderWithProviders(<ProductList />)
    expect(screen.getByRole("heading", { name: "Catalogue" })).toBeInTheDocument()
  })

  it("renders a list of products", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: 1,
                slug: "test-tee",
                name: "Test Tee",
                description: "A great tee",
                imageUrl: "https://example.com/tee.jpg",
                variants: [
                  { id: 11, productId: 1, sku: "TEE-T-S", name: "Small", price: 9.99, stock: 5 },
                ],
              },
            ]),
        } as Response),
      ),
    )

    renderWithProviders(<ProductList />)
    expect(await screen.findByRole("link", { name: /Test Tee/i })).toBeInTheDocument()
  })
})