import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => api.listProducts(),
  })
}

export function useProduct(id: number | undefined) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => api.getProduct(id as number),
    enabled: id != null,
  })
}