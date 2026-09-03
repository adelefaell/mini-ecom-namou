import { z } from "zod"

export const cartItemDto = z.object({
  id: z.number(),
  variantId: z.number(),
  quantity: z.number(),
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

export const cartDto = z.object({
  items: z.array(cartItemDto),
  total: z.number(),
})

export const addCartItemRequestDto = z.object({
  variantId: z.number().int().positive(),
  quantity: z.number().int().min(1).default(1),
})

export const updateCartItemRequestDto = z.object({
  quantity: z.number().int().min(1).optional(),
  variantId: z.number().int().positive().optional(),
})

export type CartItemDto = z.infer<typeof cartItemDto>
export type CartDto = z.infer<typeof cartDto>
export type AddCartItemRequestDto = z.infer<typeof addCartItemRequestDto>
export type UpdateCartItemRequestDto = z.infer<typeof updateCartItemRequestDto>