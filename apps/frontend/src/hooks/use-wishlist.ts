import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

export function useWishlist() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const wishlistQuery = useQuery({
    queryKey: ["wishlist"],
    queryFn: api.getWishlist,
    enabled: user != null,
    placeholderData: (previous) => previous,
  })

  const wishlist = wishlistQuery.data ?? { items: [] }

  const setWishlist = (items: { id: number; variantId: number }[]) => {
    queryClient.setQueryData(["wishlist"], { items })
  }

  const addItem = useMutation({
    mutationFn: api.addWishlistItem,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] })
      const previous = queryClient.getQueryData(["wishlist"])
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["wishlist"], context.previous)
    },
    onSuccess: (data) => queryClient.setQueryData(["wishlist"], data),
  })

  const removeItem = useMutation({
    mutationFn: api.removeWishlistItem,
    onMutate: async (itemId: number) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] })
      const previous = queryClient.getQueryData(["wishlist"])
      setWishlist(wishlist.items.filter((i) => i.id !== itemId))
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["wishlist"], context.previous)
    },
    onSuccess: (data) => queryClient.setQueryData(["wishlist"], data),
  })

  const moveToCart = useMutation({
    mutationFn: api.moveWishlistItemToCart,
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data.cart)
      queryClient.setQueryData(["wishlist"], data.wishlist)
    },
  })

  return {
    wishlist,
    addItem,
    removeItem,
    moveToCart,
    isPending: wishlistQuery.isPending,
  }
}