import { productListDto, productWithVariantsDto, authUserDto, cartDto, wishlistDto, orderDto } from "@repo/shared-types"
import type { AddCartItemRequestDto, UpdateCartItemRequestDto, AddWishlistItemRequestDto } from "@repo/shared-types"

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, schema: { parse: (x: unknown) => T }, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init)
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(body?.error?.message ?? `Request failed (${res.status})`, res.status)
  }
  return schema.parse(await res.json())
}

export const api = {
  listProducts: () => request("/api/products", productListDto),
  getProduct: (id: number) => request(`/api/products/${id}`, productWithVariantsDto),
  login: (email: string, password: string) =>
    request(
      "/api/auth/login",
      authUserDto,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
    ),
  me: () => request("/api/auth/me", authUserDto),
  logout: () => request("/api/auth/logout", { parse: (x: unknown) => x as { ok: boolean } }, { method: "POST" }),
  getCart: () => request("/api/cart", cartDto),
  addCartItem: (body: AddCartItemRequestDto) =>
    request("/api/cart/items", cartDto, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  updateCartItem: (itemId: number, body: UpdateCartItemRequestDto) =>
    request(`/api/cart/items/${itemId}`, cartDto, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  removeCartItem: (itemId: number) =>
    request(`/api/cart/items/${itemId}`, cartDto, { method: "DELETE" }),
  getWishlist: () => request("/api/wishlist", wishlistDto),
  addWishlistItem: (body: AddWishlistItemRequestDto) =>
    request("/api/wishlist/items", wishlistDto, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  removeWishlistItem: (itemId: number) =>
    request(`/api/wishlist/items/${itemId}`, wishlistDto, { method: "DELETE" }),
  moveWishlistItemToCart: (itemId: number) =>
    request(
      `/api/wishlist/items/${itemId}/move-to-cart`,
      { parse: (x: unknown) => ({ cart: cartDto.parse((x as { cart: unknown }).cart), wishlist: wishlistDto.parse((x as { wishlist: unknown }).wishlist) }) },
      { method: "POST" },
    ),
  placeOrder: () =>
    request("/api/orders", orderDto, { method: "POST" }),
}