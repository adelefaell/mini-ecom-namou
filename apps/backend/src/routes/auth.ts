import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { z } from "zod"
import * as authService from "../services/auth"
import { COOKIE_NAME } from "../services/auth"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export interface AuthUser {
  id: number
  email: string
  name: string
}

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthUser
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies[COOKIE_NAME]
  if (!token) {
    return reply.status(401).send({ error: { message: "Authentication required" } })
  }
  const user = await authService.getUserFromToken(token)
  if (!user) {
    return reply.status(401).send({ error: { message: "Authentication required" } })
  }
  request.user = user
}

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/login", async (request, reply) => {
    const { email, password } = loginSchema.parse(request.body)
    const user = await authService.authenticate(email, password)
    if (!user) {
      return reply.status(401).send({ error: { message: "Invalid email or password" } })
    }
    const token = await authService.signToken(user.id)
    reply.setCookie(COOKIE_NAME, token, authService.cookieOptions())
    return user
  })

  app.post("/auth/logout", async (_request, reply) => {
    reply.clearCookie(COOKIE_NAME, { path: "/" })
    return { ok: true }
  })

  app.get("/auth/me", { preHandler: requireAuth }, async (request) => {
    return request.user
  })
}