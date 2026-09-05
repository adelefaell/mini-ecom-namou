import { test, expect } from "@playwright/test"
import type { Page } from "@playwright/test"

async function clearCart(page: Page) {
  const res = await page.request.get("/api/cart")
  const { items } = await res.json()
  for (const item of items) {
    await page.request.delete(`/api/cart/items/${item.id}`)
  }
}

async function addTeeToCart(page: Page) {
  await page.goto("/products/1")
  await page.getByRole("button", { name: "Add to cart" }).click()
  await expect(page.getByRole("heading", { name: "Added to Classic White T-Shirt!" })).toBeVisible()
  await page.getByRole("link", { name: "View Cart" }).click()
  await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible()
}

test.describe("cart flow", () => {
  test.beforeEach(async ({ page }) => {
    await clearCart(page)
  })

  test("add an item to the cart from the detail page", async ({ page }) => {
    await addTeeToCart(page)
    await expect(page.locator("[data-testid=cart-row]")).toHaveCount(1)
  })

  test("update quantity and subtotal in the cart", async ({ page }) => {
    await addTeeToCart(page)
    await page.getByRole("button", { name: "Increase quantity of Classic White T-Shirt" }).click()

    await expect(page.locator("[data-testid=cart-row] [data-testid=cart-qty]")).toHaveText("2")
    await expect(page.locator("[data-testid=cart-row]").getByText("$39.98")).toBeVisible()
  })

  test("change the variant of an item in the cart", async ({ page }) => {
    await addTeeToCart(page)
    const select = page.locator("[data-testid=cart-row] select")
    await select.selectOption({ label: "Medium — $19.99" })
    await expect(page.locator("[data-testid=cart-row]")).toContainText("Medium")
  })

  test("remove an item from the cart", async ({ page }) => {
    await addTeeToCart(page)
    await page.getByRole("button", { name: "Remove Classic White T-Shirt" }).click()
    await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible()
  })

  test("complete a checkout and place an order", async ({ page }) => {
    await addTeeToCart(page)
    await page.getByRole("link", { name: "Checkout" }).click()
    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible()

    await page.getByRole("button", { name: "Place order" }).click()
    await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible()
    await expect(page.getByText(/Order #\d+/)).toBeVisible()

    const cart = await (await page.request.get("/api/cart")).json()
    expect(cart.items).toHaveLength(0)
  })
})