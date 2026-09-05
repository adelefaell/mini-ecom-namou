import type { FastifyInstance } from "fastify"
import * as orderService from "../services/orders"
import { requireAuth } from "./auth"

export async function orderRoutes(app: FastifyInstance) {
  app.register(async (protectedApp) => {
    protectedApp.addHook("preHandler", requireAuth)

    protectedApp.post("/orders", async (request, reply) => {
      try {
        const order = orderService.placeOrder(request.user!.id)
        return reply.status(201).send(order)
      } catch (err) {
        if (err instanceof orderService.EmptyCartError) {
          return reply.status(400).send({ error: { message: err.message } })
        }
        throw err
      }
    })
  })
}