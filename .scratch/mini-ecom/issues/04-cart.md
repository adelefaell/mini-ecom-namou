# 04 — Cart end-to-end

**What to build:** A signed-in user adds a product variant to their cart from the product detail page (and optionally the listing page), sees a cart count in the header, and manages the cart on a dedicated page: quantities and per-item subtotals, a cart total, quantity updates, item removal, and changing the chosen variant. Server-side, the cart is a per-user `CartItem` set keyed by variant. React Query mutations with optimistic updates keep the UI snappy.

**Blocked by:** 03 — Auth end-to-end (JWT).

**Status:** ready-for-agent

- [ ] "Add to Cart" on detail page (and listing) adds the selected variant to the user's cart; header cart count reflects it
- [ ] Cart page lists items with quantity, per-item subtotal, and cart total
- [ ] Quantity can be updated and items removed; the cart total stays correct
- [ ] The selected variant on an existing cart item can be changed
- [ ] Backend cart routes are auth-gated; integration tests (add/list/update/remove) + frontend cart tests; suite green