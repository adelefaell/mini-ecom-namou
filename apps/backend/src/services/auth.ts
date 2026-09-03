import { SignJWT, jwtVerify } from "jose"
import { compare } from "bcryptjs"
import { env } from "../env"
import * as userRepository from "../repositories/users"
import type { AuthUserDto } from "@repo/shared-types"

const secret = new TextEncoder().encode(env.JWT_SECRET)
const COOKIE_NAME = "session"
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

function toAuthUser(user: { id: number; email: string; name: string }): AuthUserDto {
  return { id: user.id, email: user.email, name: user.name }
}

export async function authenticate(email: string, password: string): Promise<AuthUserDto | null> {
  const user = await userRepository.findByEmail(email)
  if (!user) return null
  const ok = await compare(password, user.passwordHash)
  if (!ok) return null
  return toAuthUser(user)
}

export async function getUserFromToken(token: string): Promise<AuthUserDto | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] })
    const sub = payload.sub
    if (!sub) return null
    const user = await userRepository.findById(Number(sub))
    if (!user) return null
    return toAuthUser(user)
  } catch {
    return null
  }
}

export async function signToken(userId: number): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_MAX_AGE_SECONDS}s`)
    .sign(secret)
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: TOKEN_MAX_AGE_SECONDS,
  }
}

export { COOKIE_NAME }