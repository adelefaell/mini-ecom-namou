import { db } from "./client"
import { products, variants } from "./schema"
import { seedData } from "./seed-data"
import { eq } from "drizzle-orm"

async function upsertProduct(item: (typeof seedData)[number]) {
  const existing = db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, item.product.slug))
    .get()

  let productId: number
  if (existing) {
    await db.delete(variants).where(eq(variants.productId, existing.id))
    productId = existing.id
    const { slug: _slug, ...rest } = item.product
    await db.update(products).set(rest).where(eq(products.id, existing.id))
  } else {
    const inserted = db
      .insert(products)
      .values(item.product)
      .returning({ id: products.id })
      .get()
    productId = inserted.id
  }

  await db.insert(variants).values(
    item.variants.map((v) => ({ ...v, productId })),
  )
}

export async function seed() {
  for (const item of seedData) {
    await upsertProduct(item)
  }
  const count = db.select({ id: products.id }).from(products).all().length
  return count
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then((count) => {
      console.log(`Seeded ${count} products`)
      process.exit(0)
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}