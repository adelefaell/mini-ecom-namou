import { db } from "../db/client"
import { products, variants } from "../db/schema"
import type { ProductWithVariantsDto } from "@repo/shared-types"
import { asc, eq } from "drizzle-orm"

export async function listProducts(): Promise<ProductWithVariantsDto[]> {
  const rows = db
    .select()
    .from(products)
    .leftJoin(variants, eq(variants.productId, products.id))
    .orderBy(asc(products.id), asc(variants.id))
    .all()

  const map = new Map<number, ProductWithVariantsDto>()
  for (const { products: p, variants: v } of rows) {
    let entry = map.get(p.id)
    if (!entry) {
      entry = {
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        imageUrl: p.imageUrl,
        variants: [],
      }
      map.set(p.id, entry)
    }
    if (v) {
      entry.variants.push({
        id: v.id,
        productId: v.productId,
        sku: v.sku,
        name: v.name,
        price: v.price,
        stock: v.stock,
      })
    }
  }
  return [...map.values()]
}

export async function getProductById(id: number): Promise<ProductWithVariantsDto | null> {
  const rows = db
    .select()
    .from(products)
    .leftJoin(variants, eq(variants.productId, products.id))
    .where(eq(products.id, id))
    .orderBy(asc(variants.id))
    .all()

  if (rows.length === 0) return null
  const p = rows[0]!.products
  const result: ProductWithVariantsDto = {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    imageUrl: p.imageUrl,
    variants: [],
  }
  for (const { variants: v } of rows) {
    if (v) {
      result.variants.push({
        id: v.id,
        productId: v.productId,
        sku: v.sku,
        name: v.name,
        price: v.price,
        stock: v.stock,
      })
    }
  }
  return result
}