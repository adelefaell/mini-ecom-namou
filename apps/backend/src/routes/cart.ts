import type { FastifyInstance } from "fastify"
import { z } from "zod"
import * as cartService from "../services/cart"
import { requireAuth } from "./auth"
import {
  addCartItemRequestDto,
  updateCartItemRequestDto,
} from "@repo/shared-types"

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
})

const notFound = (message: string) => ({ error: { message } })

export async function cartRoutes(app: FastifyInstance) {
  app.register(async (protectedApp) => {
    protectedApp.addHook("preHandler", requireAuth)

    protectedApp.get("/cart", async (request) => {
      return cartService.getCart(request.user!.id)
    })

    protectedApp.post("/cart/items", async (request, reply) => {
      const body = addCartItemRequestDto.parse(request.body)
      try {
        await cartService.addItem(request.user!.id, body.variantId, body.quantity)
      } catch (err) {
        if (err instanceof cartService.VariantNotFoundError) {
          return reply.status(404).send(notFound(err.message))
        }
        if (err instanceof cartService.InsufficientStockError) {
          return reply.status(409).send(notFound(err.message))
        }
        throw err
      }
      return reply.status(201).send(await cartService.getCart(request.user!.id))
    })

    protectedApp.patch("/cart/items/:id", async (request, reply) => {
      const { id } = paramsSchema.parse(request.params)
      const body = updateCartItemRequestDto.parse(request.body)
      try {
        await cartService.updateItem(request.user!.id, id, body)
      } catch (err) {
        if (
          err instanceof cartService.CartItemNotFoundError ||
          err instanceof cartService.VariantNotFoundError
        ) {
          return reply.status(404).send(notFound(err.message))
        }
        if (err instanceof cartService.InsufficientStockError) {
          return reply.status(409).send(notFound(err.message))
        }
        throw err
      }
      return cartService.getCart(request.user!.id)
    })

    protectedApp.delete("/cart/items/:id", async (request, reply) => {
      const { id } = paramsSchema.parse(request.params)
      try {
        await cartService.removeItem(request.user!.id, id)
      } catch (err) {
        if (err instanceof cartService.CartItemNotFoundError) {
          return reply.status(404).send(notFound(err.message))
        }
        throw err
      }
      return cartService.getCart(request.user!.id)
    })
  })
}