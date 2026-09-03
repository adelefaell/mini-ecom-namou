import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    fileParallelism: false,
    env: {
      DATABASE_URL: "file:./data/test.db",
      NODE_ENV: "test",
    },
  },
})