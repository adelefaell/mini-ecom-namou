import type { FastifyInstance } from "fastify"
import { z } from "zod"
import * as wishlistService from "../services/wishlist"
import * as cartService from "../services/cart"
import { requireAuth } from "./auth"
import { addWishlistItemRequestDto } from "@repo/shared-types"

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export async function wishlistRoutes(app: FastifyInstance) {
  app.register(async (protectedApp) => {
    protectedApp.addHook("preHandler", requireAuth)

    protectedApp.get("/wishlist", async (request) => {
      return wishlistService.getWishlist(request.user!.id)
    })

    protectedApp.post("/wishlist/items", async (request, reply) => {
      const body = addWishlistItemRequestDto.parse(request.body)
      if (!(await wishlistService.variantExists(body.variantId))) {
        return reply.status(404).send({ error: { message: "Variant not found" } })
      }
      await wishlistService.addItem(request.user!.id, body.variantId)
      return reply.status(201).send(await wishlistService.getWishlist(request.user!.id))
    })

    protectedApp.delete("/wishlist/items/:id", async (request, reply) => {
      const { id } = paramsSchema.parse(request.params)
      const ok = await wishlistService.removeItem(request.user!.id, id)
      if (!ok) {
        return reply.status(404).send({ error: { message: "Wishlist item not found" } })
      }
      return wishlistService.getWishlist(request.user!.id)
    })

    protectedApp.post("/wishlist/items/:id/move-to-cart", async (request, reply) => {
      const { id } = paramsSchema.parse(request.params)
      const item = await wishlistService.findByUserIdAndId(request.user!.id, id)
      if (!item) {
        return reply.status(404).send({ error: { message: "Wishlist item not found" } })
      }
      try {
        await cartService.addItem(request.user!.id, item.variantId, 1)
      } catch (err) {
        if (err instanceof cartService.InsufficientStockError) {
          return reply.status(409).send({ error: { message: err.message } })
        }
        if (err instanceof cartService.VariantNotFoundError) {
          return reply.status(404).send({ error: { message: err.message } })
        }
        throw err
      }
      await wishlistService.removeItem(request.user!.id, id)
      return {
        cart: await cartService.getCart(request.user!.id),
        wishlist: await wishlistService.getWishlist(request.user!.id),
      }
    })
  })
}