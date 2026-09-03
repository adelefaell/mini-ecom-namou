import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useProduct } from "@/hooks/use-products"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Check } from "lucide-react"

export default function ProductDetail() {
  const { id } = useParams()
  const productId = id ? Number(id) : undefined
  const { data: product, isLoading, isError } = useProduct(productId)
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)

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

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to catalogue
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="aspect-square w-full rounded-xl object-cover"
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}