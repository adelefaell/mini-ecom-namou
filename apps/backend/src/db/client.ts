import { mkdirSync } from "node:fs"
import { dirname } from "node:path"
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { env } from "../env"

const file = env.DATABASE_URL.replace(/^file:/, "")
mkdirSync(dirname(file), { recursive: true })

const sqlite = new Database(file)
sqlite.pragma("journal_mode = WAL")
sqlite.pragma("foreign_keys = ON")

export const db = drizzle(sqlite)