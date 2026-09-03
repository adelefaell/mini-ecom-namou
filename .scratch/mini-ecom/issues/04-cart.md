# 04 — Cart end-to-end

**What to build:** A signed-in user adds a product variant to their cart from the product detail page (and optionally the listing page), sees a cart count in the header, and manages the cart on a dedicated page: quantities and per-item subtotals, a cart total, quantity updates, item removal, and changing the chosen variant. Server-side, the cart is a per-user `CartItem` set keyed by variant. React Query mutations with optimistic updates keep the UI snappy.

**Blocked by:** 03 — Auth end-to-end (JWT).

**Status:** resolved

- [x] "Add to Cart" on detail page (and listing) adds the selected variant to the user's cart; header cart count reflects it
- [x] Cart page lists items with quantity, per-item subtotal, and cart total
- [x] Quantity can be updated and items removed; the cart total stays correct
- [x] The selected variant on an existing cart item can be changed
- [x] Backend cart routes are auth-gated; integration tests (add/list/update/remove) + frontend cart tests; suite green

## Comments

- Cart endpoints: `GET /api/cart`, `POST /api/cart/items`, `PATCH /api/cart/items/:id` (quantity and/or variantId), `DELETE /api/cart/items/:id` — all behind `requireAuth`.
- Unique (user_id, variant_id) index; adding an existing variant sets its quantity to the payload value.
- Frontend uses React Query optimistic updates via `useCart` (apps/frontend/src/hooks/use-cart.ts); total recomputed locally on optimistic writes.
- Unauthenticated visitors hitting `/cart` are redirected to `/login` (frontend); backend rejects with 401.
- Fixed two latent issues found while testing: better-sqlite3 drizzle `.where()` takes a single arg (was silently dropping the second `eq`), and backend tests now run serially (`fileParallelism: false`) since they share `test.db`.