import * as productRepository from "../repositories/products"
import type { ProductWithVariantsDto } from "@repo/shared-types"

export async function listProducts(): Promise<ProductWithVariantsDto[]> {
  return productRepository.listProducts()
}

export async function getProductById(id: number): Promise<ProductWithVariantsDto | null> {
  return productRepository.getProductById(id)
}