import type { FastifyInstance } from "fastify"
import { z } from "zod"
import * as cartService from "../services/cart"
import { requireAuth } from "./auth"
import { db } from "../db/client"
import { variants } from "../db/schema"
import { eq } from "drizzle-orm"
import { addCartItemRequestDto, updateCartItemRequestDto } from "@repo/shared-types"

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
})

async function variantExists(id: number) {
  return db.select({ id: variants.id }).from(variants).where(eq(variants.id, id)).get() != null
}

export async function cartRoutes(app: FastifyInstance) {
  app.register(async (protectedApp) => {
    protectedApp.addHook("preHandler", requireAuth)

    protectedApp.get("/cart", async (request) => {
      return cartService.getCart(request.user!.id)
    })

    protectedApp.post("/cart/items", async (request, reply) => {
      const body = addCartItemRequestDto.parse(request.body)
      if (!(await variantExists(body.variantId))) {
        return reply.status(404).send({ error: { message: "Variant not found" } })
      }
      await cartService.addItem(request.user!.id, body.variantId, body.quantity)
      return reply.status(201).send(await cartService.getCart(request.user!.id))
    })

    protectedApp.patch("/cart/items/:id", async (request, reply) => {
      const { id } = paramsSchema.parse(request.params)
      const body = updateCartItemRequestDto.parse(request.body)
      if (body.variantId != null && !(await variantExists(body.variantId))) {
        return reply.status(404).send({ error: { message: "Variant not found" } })
      }
      const ok = await cartService.updateItem(request.user!.id, id, body)
      if (!ok) {
        return reply.status(404).send({ error: { message: "Cart item not found" } })
      }
      return cartService.getCart(request.user!.id)
    })

    protectedApp.delete("/cart/items/:id", async (request, reply) => {
      const { id } = paramsSchema.parse(request.params)
      const ok = await cartService.removeItem(request.user!.id, id)
      if (!ok) {
        return reply.status(404).send({ error: { message: "Cart item not found" } })
      }
      return cartService.getCart(request.user!.id)
    })
  })
}