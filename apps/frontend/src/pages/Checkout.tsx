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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { CheckCircle2, ShoppingBag } from "lucide-react"

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
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingBag className="size-4" />
            </EmptyMedia>
            <EmptyTitle>Your cart is empty</EmptyTitle>
            <EmptyDescription>
              <Link to="/">Browse the catalogue</Link> and add something you like.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
      <div className="mt-6 space-y-4">
        {cart.items.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <SkeletonImage
                src={item.product.imageUrl}
                alt={item.product.name}
                loading="lazy"
                className="h-20 w-20 shrink-0 rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.product.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.variant.name} × {item.quantity}
                </p>
              </div>
              <span className="font-medium">
                ${(item.variant.price * item.quantity).toFixed(2)}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border p-4">
        <span className="font-medium">Total</span>
        <span className="text-2xl font-semibold">${cart.total.toFixed(2)}</span>
      </div>

      <div className="mt-6">
        <Button
          className="w-full"
          size="lg"
          onClick={() => placeOrder.mutate()}
          disabled={placeOrder.isPending}
        >
          {placeOrder.isPending ? <Spinner /> : null}
          {placeOrder.isPending ? "Placing order..." : "Place order"}
        </Button>
      </div>
    </div>
  )
}