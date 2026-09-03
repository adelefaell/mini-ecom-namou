# 06 — Checkout & orders

**What to build:** A signed-in user reviews their cart and confirms the order with a mocked "Place Order" action. The backend creates an order (with its line items) in a transaction, increments nothing further, and clears the cart. The frontend then shows an order confirmation screen with an order summary. A separate "my orders" list is out of scope beyond the confirmation.

**Blocked by:** 04 — Cart end-to-end.

**Status:** resolved

- [x] Checkout page shows a cart review before confirming
- [x] "Place Order" creates an order record with line items and clears the cart
- [x] Confirmation screen shows an order summary after placing
- [x] Checkout and order creation are auth-gated; backend integration tests (order created, cart cleared) + frontend checkout/confirmation test; suite green

## Comments

- `POST /api/orders` behind `requireAuth`: snapshots cart with current unit prices into `orders` + `order_items` in one transaction (drizzle `db.transaction`), then clears the cart. Empty cart → 400.
- Order items denormalize product/variant name + image so historical orders survive catalogue edits.
- Frontend `Checkout` page: cart review → Place order → inline confirmation with order summary; cart cache reset to empty on success.
- Checkout reachable via "Checkout" button on cart page.