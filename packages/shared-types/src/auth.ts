import { z } from "zod"

export const authUserDto = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
})

export const loginRequestDto = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type AuthUserDto = z.infer<typeof authUserDto>
export type LoginRequestDto = z.infer<typeof loginRequestDto>