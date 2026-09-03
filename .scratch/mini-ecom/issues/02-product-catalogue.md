# 02 — Product catalogue end-to-end

**What to build:** Browse 15 seeded products, each showing title, price and variants (14 products have more than one variant). Product detail page shows full description, stock remaining, and variant selection. `GET /api/products` and `GET /api/products/:id` power a catalogue grid and detail page with skeleton loading states. The detail page is the anchor the cart and wishlist actions attach to later.

**Blocked by:** 01 — Monorepo restructure & tooling baseline.

**Status:** done

- [x] Product + Variant schema, migration, 15-product seed
- [x] GET /api/products and GET /api/products/:id with validation
- [x] Catalogue grid page + product detail page with variant selection
- [x] Backend integration tests + frontend rendering tests; suite green