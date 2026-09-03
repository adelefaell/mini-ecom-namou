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
import type { ProductWithVariantsDto, VariantDto } from "@repo/shared-types"

function NotFound() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold">Product not found</h1>
      <Link to="/" className="mt-4 inline-block text-primary underline-offset-4 hover:underline">
        Back to catalogue
      </Link>
    </div>
  )
}

function DetailSkeleton() {
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

function VariantPicker({
  variants,
  selectedVariantId,
  onSelect,
}: {
  variants: VariantDto[]
  selectedVariantId: number | null
  onSelect: (id: number) => void
}) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-medium">Select variant</h2>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => (
          <Button
            key={variant.id}
            size="sm"
            variant={selectedVariantId === variant.id ? "default" : "outline"}
            onClick={() => onSelect(variant.id)}
          >
            {variant.name}
            {selectedVariantId === variant.id && <Check className="size-3.5" />}
          </Button>
        ))}
      </div>
    </div>
  )
}

function PurchasePanel({
  variant,
  user,
  isWishlisted,
  isAdding,
  isSaving,
  onAddToCart,
  onAddToWishlist,
}: {
  variant: VariantDto
  user: { id: number; email: string; name: string } | null
  isWishlisted: boolean
  isAdding: boolean
  isSaving: boolean
  onAddToCart: () => void
  onAddToWishlist: () => void
}) {
  const inStock = variant.stock > 0

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold">${variant.price.toFixed(2)}</span>
          <Badge variant={inStock ? "secondary" : "destructive"}>
            {inStock ? `${variant.stock} in stock` : "Out of stock"}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">SKU: {variant.sku}</p>
        <div className="mt-4 flex gap-2">
          <Button
            className="flex-1"
            onClick={onAddToCart}
            disabled={!inStock || isAdding}
          >
            {isAdding ? (
              <>
                <Spinner /> Adding...
              </>
            ) : !user ? (
              "Sign in to add to cart"
            ) : inStock ? (
              "Add to cart"
            ) : (
              "Out of stock"
            )}
          </Button>
          {user && (
            <Button
              variant={isWishlisted ? "secondary" : "outline"}
              onClick={onAddToWishlist}
              disabled={isWishlisted || isSaving}
            >
              {isSaving ? <Spinner /> : <Heart className="size-4" />}
              {isWishlisted ? "Saved" : "Save"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

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
    return <NotFound />
  }

  if (isLoading || !product) {
    return <DetailSkeleton />
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
    await addItem.mutateAsync({ variantId: selectedVariant.id, quantity: 1 })
    if (openSheet) {
      setJustAdded(product!.name)
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

          <VariantPicker
            variants={product.variants}
            selectedVariantId={selectedVariantId}
            onSelect={setSelectedVariantId}
          />

          {selectedVariant && (
            <PurchasePanel
              variant={selectedVariant}
              user={user}
              isWishlisted={isWishlisted}
              isAdding={addItem.isPending}
              isSaving={addWishlistItem.isPending}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
            />
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