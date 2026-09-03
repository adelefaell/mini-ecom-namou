import { Link, Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { useWishlist } from "@/hooks/use-wishlist"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingCart, Trash2 } from "lucide-react"

export default function Wishlist() {
  const { user, isPending: isAuthPending } = useAuth()
  const { wishlist, removeItem, moveToCart, isPending } = useWishlist()

  if (isAuthPending) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-40" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (isPending) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-40" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (wishlist.items.length === 0) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Your wishlist is empty</h1>
        <Link to="/" className="mt-4 inline-block text-primary underline-offset-4 hover:underline">
          Browse the catalogue
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Your wishlist</h1>
      <div className="mt-6 space-y-4">
        {wishlist.items.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="h-20 w-20 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <Link
                  to={`/products/${item.product.id}`}
                  className="font-medium hover:underline"
                >
                  {item.product.name}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.variant.name} — ${item.variant.price.toFixed(2)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveToCart.mutate(item.id)}
                >
                  <ShoppingCart className="size-4" />
                  Move to cart
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem.mutate(item.id)}
                  aria-label={`Remove ${item.product.name}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}