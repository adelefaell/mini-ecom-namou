import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"
import Login from "./Login"
import { AuthProvider } from "@/hooks/use-auth"

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<div>Home page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe("Login", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("signs in and navigates to the catalogue", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes("/api/auth/me")) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ error: { message: "Authentication required" } }),
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 1, email: "demo@mini-ecom.dev", name: "Demo User" }),
        })
      }),
    )

    const user = userEvent.setup()
    renderWithProviders()
    await user.type(screen.getByLabelText("Email"), "demo@mini-ecom.dev")
    await user.type(screen.getByLabelText("Password"), "demo-password")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(await screen.findByText("Home page")).toBeInTheDocument()
  })

  it("shows an error on bad credentials", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: { message: "Invalid email or password" } }),
        }),
      ),
    )

    const user = userEvent.setup()
    renderWithProviders()
    await user.type(screen.getByLabelText("Email"), "demo@mini-ecom.dev")
    await user.type(screen.getByLabelText("Password"), "wrong-password")
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument()
  })
})