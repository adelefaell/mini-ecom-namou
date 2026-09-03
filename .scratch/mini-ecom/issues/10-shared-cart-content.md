# 10 — Shared cart content (sheet + page)

**What to build:** One reusable cart content component rendered in two variants — "compact" for the sheet and "full" for the `/cart` page — so quantity/remove/variant behaviour lives in a single DRY implementation.

**Blocked by:** 08 — Cart sheet on add-to-cart.

**Status:** ready-for-agent

- [ ] `CartContent` component with a `compact` and `full` variant, driven by the shared cart query cache
- [ ] Compact variant (sheet): name, variant, quantity stepper, line price, remove; no checkout CTA
- [ ] Full variant (`/cart` page): larger layout, variant selector dropdown, per-item subtotal, cart total, "Proceed to Checkout" button — current page behaviour preserved
- [ ] Existing `/cart` page tests stay green after the extraction
- [ ] Tests: both variants render the correct portions, updates stay in sync (mutate in one, reflected in the other)