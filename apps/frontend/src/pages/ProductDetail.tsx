import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { useProduct } from "@/hooks/use-products"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SkeletonImage } from "@/components/ui/skeleton-image"
import { Spinner } from "@/components/ui/spinner"
import { CartSheet } from "@/components/cart/CartSheet"
import { ArrowLeft, Check, Heart } from "lucide-react"
import type { ProductWithVariantsDto } from "@repo/shared-types"

export default function ProductDetail() {
  const { id } = useParams()
  const productId = id ? Number(id) : undefined
  const { data: product, isLoading, isError } = useProduct(productId)
  const { user } = useAuth()
  const { addItem, cart } = useCart()
  const { wishlist, addItem: addWishlistItem } = useWishlist()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [justAdded, setJustAdded] = useState<string | null>(null)

  if (isError || (productId != null && Number.isNaN(productId))) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <Link to="/" className="mt-4 inline-block text-primary underline-offset-4 hover:underline">
          Back to catalogue
        </Link>
      </div>
    )
  }

  if (isLoading || !product) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="h-4 w-32" />
        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    )
  }

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0]

  async function handleAddToCart() {
    if (!user) {
      navigate("/login")
      return
    }
    if (!selectedVariant || selectedVariant.stock <= 0) return

    const openSheet = cart.items.length === 0
    const addedName = product!.name
    await addItem.mutateAsync({ variantId: selectedVariant.id, quantity: 1 })
    if (openSheet) {
      setJustAdded(addedName)
      setSheetOpen(true)
    }

    queryClient.setQueryData<ProductWithVariantsDto>(["products", productId], (current) => {
      if (!current) return current
      return {
        ...current,
        variants: current.variants.map((variant) =>
          variant.id === selectedVariant.id
            ? { ...variant, stock: Math.max(0, variant.stock - 1) }
            : variant,
        ),
      }
    })
  }

  async function handleAddToWishlist() {
    if (!user) {
      navigate("/login")
      return
    }
    if (!selectedVariant) return
    await addWishlistItem.mutateAsync({ variantId: selectedVariant.id })
  }

  const isWishlisted =
    selectedVariant != null && wishlist.items.some((i) => i.variantId === selectedVariant.id)

  const isAddDisabled = selectedVariant == null || selectedVariant.stock <= 0

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to catalogue
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
        <SkeletonImage
          src={product.imageUrl}
          alt={product.name}
          loading="eager"
          className="aspect-square w-full rounded-xl"
        />
        <div className="flex flex-col gap-4">
          <div>
            <Badge variant="outline">{product.variants.length} variants</Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{product.name}</h1>
            <p className="mt-2 text-muted-foreground">{product.description}</p>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-medium">Select variant</h2>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <Button
                  key={variant.id}
                  size="sm"
                  variant={selectedVariant?.id === variant.id ? "default" : "outline"}
                  onClick={() => setSelectedVariantId(variant.id)}
                >
                  {variant.name}
                  {selectedVariant?.id === variant.id && <Check className="size-3.5" />}
                </Button>
              ))}
            </div>
          </div>

          {selectedVariant && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-semibold">
                    ${selectedVariant.price.toFixed(2)}
                  </span>
                  <Badge
                    variant={selectedVariant.stock > 0 ? "secondary" : "destructive"}
                  >
                    {selectedVariant.stock > 0
                      ? `${selectedVariant.stock} in stock`
                      : "Out of stock"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">SKU: {selectedVariant.sku}</p>
                <div className="mt-4 flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={isAddDisabled || addItem.isPending}
                  >
                    {addItem.isPending ? (
                      <>
                        <Spinner /> Adding...
                      </>
                    ) : !user ? (
                      "Sign in to add to cart"
                    ) : selectedVariant.stock > 0 ? (
                      "Add to cart"
                    ) : (
                      "Out of stock"
                    )}
                  </Button>
                  {user && (
                    <Button
                      variant={isWishlisted ? "secondary" : "outline"}
                      onClick={handleAddToWishlist}
                      disabled={isWishlisted || addWishlistItem.isPending}
                    >
                      {addWishlistItem.isPending ? (
                        <Spinner />
                      ) : (
                        <Heart className="size-4" />
                      )}
                      {isWishlisted ? "Saved" : "Save"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CartSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        justAddedName={justAdded}
      />
    </div>
  )
}