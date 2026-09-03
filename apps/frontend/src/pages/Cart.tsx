import { Link, Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import { useProducts } from "@/hooks/use-products"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Trash2 } from "lucide-react"

export default function Cart() {
  const { user, isPending: isAuthPending } = useAuth()
  const { cart, updateItem, removeItem, isPending } = useCart()
  const { data: products } = useProducts()

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

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <Link to="/" className="mt-4 inline-block text-primary underline-offset-4 hover:underline">
          Browse the catalogue
        </Link>
      </div>
    )
  }

  const variantsOf = (productId: number) =>
    products?.find((p) => p.id === productId)?.variants ?? []

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Your cart</h1>
      <div className="mt-6 space-y-4">
        {cart.items.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="h-20 w-20 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.product.name}</p>
                <label className="mt-1 block text-sm">
                  <span className="text-muted-foreground">Variant: </span>
                  <select
                    value={item.variantId}
                    onChange={(e) =>
                      updateItem.mutate({ itemId: item.id, patch: { variantId: Number(e.target.value) } })
                    }
                    className="h-7 rounded-lg border border-input bg-transparent px-2 text-sm"
                  >
                    {variantsOf(item.product.id).map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} — ${v.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateItem.mutate({ itemId: item.id, patch: { quantity: item.quantity - 1 } })
                    }
                    disabled={item.quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateItem.mutate({ itemId: item.id, patch: { quantity: item.quantity + 1 } })
                    }
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-medium">${(item.variant.price * item.quantity).toFixed(2)}</span>
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

      <div className="mt-6 flex items-center justify-between rounded-xl border p-4">
        <span className="font-medium">Total</span>
        <span className="text-2xl font-semibold">${cart.total.toFixed(2)}</span>
      </div>

      <div className="mt-6">
        <Button className="w-full" size="lg" render={<Link to="/checkout" />}>
          Checkout
        </Button>
      </div>
    </div>
  )
}