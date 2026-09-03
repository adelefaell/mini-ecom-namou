import { productListDto, productWithVariantsDto } from "@repo/shared-types"
import type { ProductWithVariantsDto } from "@repo/shared-types"

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, schema: { parse: (x: unknown) => T }): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(body?.error?.message ?? `Request failed (${res.status})`, res.status)
  }
  return schema.parse(await res.json())
}

export const api = {
  listProducts: () => request("/api/products", productListDto),
  getProduct: (id: number) => request(`/api/products/${id}`, productWithVariantsDto),
}

export type { ProductWithVariantsDto }