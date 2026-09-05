import { useState } from "react"
import { Link } from "react-router-dom"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { RemoveConfirmDialog } from "@/components/cart/RemoveConfirmDialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { CheckCircle2, Minus, Plus, Trash2 } from "lucide-react"

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  justAddedName?: string | null
}

export function CartSheet({ open, onOpenChange, justAddedName }: CartSheetProps) {
  const { cart, updateItem, removeItem } = useCart()
  const [pendingDelete, setPendingDelete] = useState<{ id: number; name: string } | null>(null)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {justAddedName && <CheckCircle2 className="size-5 text-primary" />}
            {justAddedName ? `Added to ${justAddedName}!` : "Your cart"}
          </SheetTitle>
          <SheetDescription>
            {cart.items.length > 0
              ? `${cart.items.reduce((sum, item) => sum + item.quantity, 0)} item${cart.items.length > 1 ? "s" : ""} in your cart`
              : "Your cart is empty"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          {cart.items.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nothing here yet — keep browsing.
            </p>
          )}
          {cart.items.map((item) => {
            const rowBusy =
              (updateItem.isPending && updateItem.variables?.itemId === item.id) ||
              (removeItem.isPending && removeItem.variables === item.id)
            return (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  loading="lazy"
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.variant.name} — ${item.variant.price.toFixed(2)}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() =>
                        updateItem.mutate({ itemId: item.id, patch: { quantity: item.quantity - 1 } })
                      }
                      disabled={item.quantity <= 1 || rowBusy}
                      aria-label={`Decrease quantity of ${item.product.name}`}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() =>
                        updateItem.mutate({ itemId: item.id, patch: { quantity: item.quantity + 1 } })
                      }
                      disabled={rowBusy}
                      aria-label={`Increase quantity of ${item.product.name}`}
                    >
                      <Plus className="size-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon-xs"
                      onClick={() =>
                        item.quantity > 1
                          ? setPendingDelete({ id: item.id, name: item.product.name })
                          : removeItem.mutate(item.id)
                      }
                      disabled={rowBusy}
                      aria-label={`Remove ${item.product.name}`}
                    >
                      {removeItem.isPending && removeItem.variables === item.id ? (
                        <Spinner className="size-3" />
                      ) : (
                        <Trash2 className="size-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <span className="text-sm font-medium">
                  ${(item.variant.price * item.quantity).toFixed(2)}
                </span>
              </div>
            )
          })}
        </div>

        {cart.items.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <span className="text-sm font-medium">Total</span>
            <span className="text-lg font-semibold">${cart.total.toFixed(2)}</span>
          </div>
        )}

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Continue Shopping
          </Button>
          <Button render={<Link to="/cart" onClick={() => onOpenChange(false)} />}>View Cart →</Button>
        </SheetFooter>

        <RemoveConfirmDialog
          pending={pendingDelete}
          onClose={() => setPendingDelete(null)}
          onConfirm={(id) => removeItem.mutate(id)}
        />
      </SheetContent>
    </Sheet>
  )
}
