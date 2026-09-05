import { join } from "node:path"

export const E2E_DB = "file:./data/e2e.db"

export const BACKEND_ENV = {
  NODE_ENV: "test",
  DATABASE_URL: E2E_DB,
}

const dataDir = join(import.meta.dirname, "../backend/data")

export function e2eDbFiles() {
  return ["e2e.db", "e2e.db-wal", "e2e.db-shm"].map((name) => join(dataDir, name))
}