import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { ThemeProvider, useTheme } from "./theme-provider"
import { ModeToggle } from "./mode-toggle"

vi.mock("@base-ui/react/menu", () => {
  const Root = ({ children }: { children: React.ReactNode }) => <>{children}</>
  const Trigger = ({ render, ...props }: any) => (
    <>{render ? <button {...render.props} {...props} /> : <button {...props} />}</>
  )
  const Portal = ({ children }: { children: React.ReactNode }) => <>{children}</>
  const Positioner = ({ children }: { children: React.ReactNode }) => <>{children}</>
  const Popup = ({ children }: { children: React.ReactNode }) => <div role="menu">{children}</div>
  const Item = ({
    children,
    ...props
  }: {
    children: React.ReactNode
    onClick?: () => void
  }) => (
    <button role="menuitem" onClick={props.onClick}>
      {children}
    </button>
  )
  return { Menu: { Root, Trigger, Portal, Positioner, Popup, Item } }
})

beforeEach(() => {
  localStorage.clear()
  document.documentElement.className = ""
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  }))
})

afterEach(() => {
  vi.restoreAllMocks()
})

function Controller() {
  const { setTheme } = useTheme()
  return <button onClick={() => setTheme("dark")}>Go dark</button>
}

describe("ModeToggle", () => {
  it("defaults to system theme", () => {
    render(
      <ThemeProvider>
        <ModeToggle />
      </ThemeProvider>,
    )
    expect(document.documentElement.className).toContain("light")
  })

  it("respects a stored dark preference", () => {
    localStorage.setItem("vite-ui-theme", "dark")
    render(
      <ThemeProvider>
        <ModeToggle />
      </ThemeProvider>,
    )
    expect(document.documentElement.className).toContain("dark")
  })

  it("switches to dark from the menu and persists", async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <ModeToggle />
      </ThemeProvider>,
    )
    await user.click(screen.getByRole("button", { name: "Toggle theme" }))
    await user.click(await screen.findByRole("menuitem", { name: /Dark/ }))
    expect(document.documentElement.className).toContain("dark")
    expect(localStorage.getItem("vite-ui-theme")).toBe("dark")
  })

  it("theme switching updates the class and persists", () => {
    render(
      <ThemeProvider>
        <Controller />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByRole("button", { name: "Go dark" }))
    expect(document.documentElement.className).toContain("dark")
    expect(localStorage.getItem("vite-ui-theme")).toBe("dark")
  })
})