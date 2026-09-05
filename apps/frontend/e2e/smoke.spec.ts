import { test, expect } from "@playwright/test"

test("storefront shell renders", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("link", { name: "Mini E-Com" })).toBeVisible()
})