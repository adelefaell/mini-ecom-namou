import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import type { CartDto } from "@repo/shared-types"

export function useCart() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: api.getCart,
    enabled: user != null,
    placeholderData: (previous) => previous,
  })

  const cart = cartQuery.data ?? { items: [], total: 0 }

  const applyCart = (updater: (cart: CartDto) => Partial<CartDto>) => {
    queryClient.setQueryData<CartDto>(["cart"], (current) => {
      const base = current ?? { items: [], total: 0 }
      const next = { ...base, ...updater(base) }
      return { ...next, total: next.items.reduce((s, i) => s + i.variant.price * i.quantity, 0) }
    })
  }

  const addItem = useMutation({
    mutationFn: api.addCartItem,
    onMutate: async ({ variantId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] })
      const previous = queryClient.getQueryData<CartDto>(["cart"])
      applyCart((cart) => {
        const existing = cart.items.find((i) => i.variantId === variantId)
        if (existing) {
          return {
            items: cart.items.map((i) =>
              i.variantId === variantId ? { ...i, quantity: i.quantity + (quantity ?? 1) } : i,
            ),
          }
        }
        return cart
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["cart"], context.previous)
    },
    onSuccess: (data) => queryClient.setQueryData(["cart"], data),
  })

  const updateItem = useMutation({
    mutationFn: ({ itemId, patch }: { itemId: number; patch: { quantity?: number; variantId?: number } }) =>
      api.updateCartItem(itemId, patch),
    onMutate: async ({ itemId, patch }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] })
      const previous = queryClient.getQueryData<CartDto>(["cart"])
      applyCart((cart) => ({
        ...cart,
        items: cart.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
      }))
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["cart"], context.previous)
    },
    onSuccess: (data) => queryClient.setQueryData(["cart"], data),
  })

  const removeItem = useMutation({
    mutationFn: api.removeCartItem,
    onMutate: async (itemId: number) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] })
      const previous = queryClient.getQueryData<CartDto>(["cart"])
      applyCart((c) => ({ items: c.items.filter((i) => i.id !== itemId) }))
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["cart"], context.previous)
    },
    onSuccess: (data) => queryClient.setQueryData(["cart"], data),
  })

  const count = cart.items.reduce((sum, i) => sum + i.quantity, 0)

  return { cart, count, addItem, updateItem, removeItem, isPending: cartQuery.isPending }
}