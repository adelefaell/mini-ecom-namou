import * as wishlistRepository from "../repositories/wishlist"
import type { WishlistDto } from "@repo/shared-types"

export function getWishlist(userId: number): Promise<WishlistDto> {
  return wishlistRepository.getWishlist(userId)
}

export function addItem(userId: number, variantId: number) {
  return wishlistRepository.addItem(userId, variantId)
}

export function removeItem(userId: number, itemId: number) {
  return wishlistRepository.removeItem(userId, itemId)
}

export function findByUserIdAndId(userId: number, itemId: number) {
  return wishlistRepository.findByUserIdAndId(userId, itemId)
}

export function variantExists(id: number) {
  return wishlistRepository.variantExists(id)
}

export function removeByVariant(userId: number, variantId: number) {
  return wishlistRepository.removeByVariant(userId, variantId)
}