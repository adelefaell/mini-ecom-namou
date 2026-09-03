import { test, expect } from "@playwright/test"

test("storefront shell renders", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Mini E-Com" })).toBeVisible()
})