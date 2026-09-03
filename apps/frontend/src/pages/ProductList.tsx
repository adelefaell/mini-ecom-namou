import { Link } from "react-router-dom"
import { useProducts } from "@/hooks/use-products"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

function Currency({ value }: { value: number }) {
  return (
    <span>
      ${value.toFixed(2)}
    </span>
  )
}

export default function ProductList() {
  const { data: products, isLoading, isError } = useProducts()

  if (isError) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Failed to load products. Please try again.
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Catalogue</h1>
        <p className="text-muted-foreground">Browse our hand-picked essentials.</p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products?.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`} className="group">
              <Card className="h-full transition-shadow hover:shadow-lg">
                <CardHeader>
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-xl object-cover"
                  />
                </CardHeader>
                <CardContent>
                  <CardTitle className="group-hover:underline">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {product.description}
                  </CardDescription>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="outline">
                      {product.variants.length} variant{product.variants.length === 1 ? "" : "s"}
                    </Badge>
                    <span className="font-medium">
                      {product.variants.length > 0 ? (
                        <Currency value={Math.min(...product.variants.map((v) => v.price))} />
                      ) : null}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}