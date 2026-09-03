import { z } from "zod"

export const orderItemDto = z.object({
  id: z.number(),
  variantId: z.number(),
  quantity: z.number(),
  unitPrice: z.number(),
  productName: z.string(),
  variantName: z.string(),
  imageUrl: z.string(),
})

export const orderDto = z.object({
  id: z.number(),
  total: z.number(),
  createdAt: z.string(),
  items: z.array(orderItemDto),
})

export type OrderItemDto = z.infer<typeof orderItemDto>
export type OrderDto = z.infer<typeof orderDto>