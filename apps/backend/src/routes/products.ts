import type { FastifyInstance } from "fastify"
import { z } from "zod"
import * as productService from "../services/products"

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export async function productRoutes(app: FastifyInstance) {
  app.get("/products", async () => {
    return productService.listProducts()
  })

  app.get("/products/:id", async (request, reply) => {
    const { id } = paramsSchema.parse(request.params)
    const product = await productService.getProductById(id)
    if (!product) {
      return reply.status(404).send({ error: { message: "Product not found" } })
    }
    return product
  })
}