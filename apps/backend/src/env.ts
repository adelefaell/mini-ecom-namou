import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().default("file:./data/mini-ecom.db"),
  JWT_SECRET: z.string().min(16).default("dev-only-secret-change-me"),
  // Set COOKIE_SECURE=true only behind HTTPS. Off by default so the plain-HTTP
  // production deployment (nginx) still accepts the session cookie.
  COOKIE_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
})

export const env = envSchema.parse(process.env)