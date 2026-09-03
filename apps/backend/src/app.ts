import Fastify, { type FastifyInstance } from "fastify"
import cors from "@fastify/cors"
import { ZodError } from "zod"
import { productRoutes } from "./routes/products"

async function apiRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok" }))
  app.register(productRoutes)
}

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true })

  app.register(cors, { origin: true })
  app.register(apiRoutes, { prefix: "/api" })

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error)
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: { message: "Validation failed", issues: error.flatten() } })
    }
    const err = error as { statusCode?: number; message?: string }
    const message = err.message ?? "Internal Server Error"
    reply.status(err.statusCode ?? 500).send({ error: { message } })
  })

  return app
}