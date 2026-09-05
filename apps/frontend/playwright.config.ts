import { defineConfig, devices } from "@playwright/test"
import { BACKEND_ENV } from "./e2e/constants"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  globalSetup: "./e2e/global-setup.ts",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:3002",
    trace: "on-first-retry",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
  webServer: [
    {
      command: "pnpm --filter backend dev",
      url: "http://localhost:3001/health",
      reuseExistingServer: false,
      env: BACKEND_ENV,
      timeout: 60_000,
    },
    {
      command: "pnpm dev",
      url: "http://localhost:3002",
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
})