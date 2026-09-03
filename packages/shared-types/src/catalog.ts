import { z } from "zod"

export const variantDto = z.object({
  id: z.number(),
  productId: z.number(),
  sku: z.string(),
  name: z.string(),
  price: z.number(),
  stock: z.number(),
})

export const productDto = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  imageUrl: z.string(),
})

export const productWithVariantsDto = productDto.extend({
  variants: z.array(variantDto),
})

export const productListDto = z.array(productWithVariantsDto)

export type VariantDto = z.infer<typeof variantDto>
export type ProductDto = z.infer<typeof productDto>
export type ProductWithVariantsDto = z.infer<typeof productWithVariantsDto>