import "@testing-library/jest-dom/vitest"
import { beforeEach } from "vitest"
import { useAuthStore } from "@/hooks/use-auth"

beforeEach(() => {
  useAuthStore.setState({ user: null, isPending: true })
})