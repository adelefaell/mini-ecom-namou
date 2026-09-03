# 05 — Wishlist end-to-end

**What to build:** A signed-in user saves product variants to a wishlist from the product pages, views it as a separate list, removes items, and — as a nice-to-have — moves an item straight into the cart (which removes it from the wishlist). Server-side, a per-user `WishlistItem` set keyed by variant. Runs in parallel with the cart ticket.

**Blocked by:** 03 — Auth end-to-end (JWT).

**Status:** resolved

- [x] "Add to Wishlist" on detail page (and listing) saves the selected variant; wishlist page shows it
- [x] Items can be removed from the wishlist
- [x] Wishlist page can move an item into the cart (removing it from the wishlist)
- [x] Backend wishlist routes are auth-gated; integration tests + frontend wishlist tests; suite green

## Comments

- Endpoints: `GET /api/wishlist`, `POST /api/wishlist/items`, `DELETE /api/wishlist/items/:id`, `POST /api/wishlist/items/:id/move-to-cart` — all behind `requireAuth`. Move-to-cart adds the variant (qty 1) then removes the wishlist row in one request and returns both `{ cart, wishlist }`.
- Unique (user_id, variant_id) index; re-adding a saved variant is a no-op.
- Header shows wishlist count; "Save" button on detail page flips to "Saved" once the selected variant is saved.