# 08 — Cart sheet on add-to-cart

**What to build:** When a signed-in user clicks "Add to Cart" on the product detail page, a sheet slides in from the right confirming the add and letting them make quick tweaks without leaving the page.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] "Add to Cart" (authed) opens a right-hand sheet instead of navigating away
- [ ] Sheet shows a success checkmark, "Added to [product name]", and a compact list of current cart items (name, variant, quantity stepper, line price, remove)
- [ ] "Continue Shopping" closes the sheet and keeps the user on the product page
- [ ] "View Cart →" navigates to the `/cart` page
- [ ] Sheet stays in sync with the cart via the shared cart query cache; removing an item in the sheet updates the page instantly
- [ ] Guest / out-of-stock behaviour unchanged (redirect to login; disabled button)
- [ ] Tests: sheet opens on add, continue-shopping closes, view-cart navigates, stepper updates quantity, remove deletes