import { useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SkeletonImage } from "@/components/ui/skeleton-image"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle2, Lock } from "lucide-react"

function CheckoutSkeleton() {
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

export default function Checkout() {
  const { user, isPending: isAuthPending } = useAuth()
  const { cart, isPending } = useCart()
  const queryClient = useQueryClient()
  const [order, setOrder] = useState<{ id: number; total: number; items: { productName: string; variantName: string; quantity: number; unitPrice: number }[] } | null>(null)

  const placeOrder = useMutation({
    mutationFn: api.placeOrder,
    onSuccess: (data) => {
      setOrder(data)
      queryClient.setQueryData(["cart"], { items: [], total: 0 })
    },
  })

  if (isAuthPending) {
    return <CheckoutSkeleton />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (order) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="size-12 text-primary" />
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Order confirmed</h1>
          <p className="mt-2 text-muted-foreground">Order #{order.id} — thank you!</p>
        </div>
        <Card className="mt-8">
          <CardContent className="space-y-4 p-6">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {item.productName}
                  <span className="ml-2 text-muted-foreground">
                    {item.variantName} × {item.quantity}
                  </span>
                </span>
                <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t pt-4">
              <span className="font-medium">Total</span>
              <span className="text-2xl font-semibold">${order.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        <div className="mt-8 text-center">
          <Button render={<Link to="/" />}>Continue shopping</Button>
        </div>
      </div>
    )
  }

  if (isPending) {
    return <CheckoutSkeleton />
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

return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-1 text-muted-foreground">Review your order before placing it.</p>
      </header>

      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <span>1 · Review order</span>
        <span className="h-px flex-1 bg-border" />
        <span className="text-foreground">2 · Confirmation</span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_20rem]">
        <div>
          <h2 className="text-sm font-medium">Items ({cart.items.length})</h2>
          <ul className="mt-3 divide-y">
            {cart.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-4">
                <SkeletonImage
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  loading="lazy"
                  className="h-16 w-16 shrink-0 rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.variant.name} × {item.quantity}
                  </p>
                </div>
                <span className="font-medium">
                  ${(item.variant.price * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit rounded-xl border bg-muted/40 p-5 lg:sticky lg:top-4">
          <h2 className="text-sm font-medium">Order summary</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-muted-foreground">
                <dt>
                  {item.product.name} × {item.quantity}
                </dt>
                <dd>${(item.variant.price * item.quantity).toFixed(2)}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span className="font-medium">Total</span>
            <span className="text-2xl font-semibold">${cart.total.toFixed(2)}</span>
          </div>
          <Button
            className="mt-5 w-full"
            size="lg"
            onClick={() => placeOrder.mutate()}
            disabled={placeOrder.isPending}
          >
            {placeOrder.isPending ? <Spinner /> : <Lock className="size-4" />}
            {placeOrder.isPending ? "Placing order..." : "Place order"}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Mock checkout — no payment is processed.
          </p>
        </aside>
      </div>
    </div>
  )
}