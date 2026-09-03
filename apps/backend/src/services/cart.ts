import * as cartRepository from "../repositories/cart"
import type { CartDto } from "@repo/shared-types"

export function getCart(userId: number): Promise<CartDto> {
  return cartRepository.getCart(userId)
}

export function addItem(userId: number, variantId: number, quantity: number) {
  return cartRepository.addItem(userId, variantId, quantity)
}

export function updateItem(
  userId: number,
  itemId: number,
  patch: { quantity?: number; variantId?: number },
) {
  return cartRepository.updateItem(userId, itemId, patch)
}

export function removeItem(userId: number, itemId: number) {
  return cartRepository.removeItem(userId, itemId)
}