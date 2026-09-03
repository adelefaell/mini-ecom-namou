import { useEffect } from "react"
import { create } from "zustand"
import { api, ApiError } from "@/lib/api"
import type { AuthUserDto } from "@repo/shared-types"

type AuthState = {
  user: AuthUserDto | null
  isPending: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  init: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isPending: true,
  login: async (email, password) => {
    const user = await api.login(email, password)
    set({ user })
  },
  logout: async () => {
    await api.logout()
    set({ user: null })
  },
  init: async () => {
    set({ user: null, isPending: true })
    try {
      const user = await api.me()
      set({ user, isPending: false })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        set({ user: null, isPending: false })
        return
      }
      throw err
    }
  },
}))

export function useAuth() {
  return useAuthStore()
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init)
  useEffect(() => {
    void init()
  }, [init])
  return <>{children}</>
}