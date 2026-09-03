# 05 — Wishlist end-to-end

**What to build:** A signed-in user saves product variants to a wishlist from the product pages, views it as a separate list, removes items, and — as a nice-to-have — moves an item straight into the cart (which removes it from the wishlist). Server-side, a per-user `WishlistItem` set keyed by variant. Runs in parallel with the cart ticket.

**Blocked by:** 03 — Auth end-to-end (JWT).

**Status:** ready-for-agent

- [ ] "Add to Wishlist" on detail page (and listing) saves the selected variant; wishlist page shows it
- [ ] Items can be removed from the wishlist
- [ ] Wishlist page can move an item into the cart (removing it from the wishlist)
- [ ] Backend wishlist routes are auth-gated; integration tests + frontend wishlist tests; suite green