import { join } from "node:path"
import { test as setup, expect } from "@playwright/test"

const authFile = join(import.meta.dirname, ".auth/user.json")

setup("authenticate as the demo user", async ({ page }) => {
  await page.goto("/login")
  await page.getByLabel("Email").fill("demo@mini-ecom.dev")
  await page.getByLabel("Password").fill("demo-password")
  await page.getByRole("button", { name: "Sign in" }).click()
  await expect(page.getByRole("heading", { name: "Catalogue" })).toBeVisible()
  await page.context().storageState({ path: authFile })
})