import { db } from "../db/client"
import { users } from "../db/schema"
import { eq } from "drizzle-orm"

export async function findByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email)).get() ?? null
}

export async function findById(id: number) {
  return db.select().from(users).where(eq(users.id, id)).get() ?? null
}