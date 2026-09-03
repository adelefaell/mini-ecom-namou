import { z } from "zod"

export const wishlistItemDto = z.object({
  id: z.number(),
  variantId: z.number(),
  variant: z.object({
    id: z.number(),
    sku: z.string(),
    name: z.string(),
    price: z.number(),
  }),
  product: z.object({
    id: z.number(),
    slug: z.string(),
    name: z.string(),
    imageUrl: z.string(),
  }),
})

export const wishlistDto = z.object({
  items: z.array(wishlistItemDto),
})

export const addWishlistItemRequestDto = z.object({
  variantId: z.number().int().positive(),
})

export type WishlistItemDto = z.infer<typeof wishlistItemDto>
export type WishlistDto = z.infer<typeof wishlistDto>
export type AddWishlistItemRequestDto = z.infer<typeof addWishlistItemRequestDto>