# 06 — Checkout & orders

**What to build:** A signed-in user reviews their cart and confirms the order with a mocked "Place Order" action. The backend creates an order (with its line items) in a transaction, increments nothing further, and clears the cart. The frontend then shows an order confirmation screen with an order summary. A separate "my orders" list is out of scope beyond the confirmation.

**Blocked by:** 04 — Cart end-to-end.

**Status:** ready-for-agent

- [ ] Checkout page shows a cart review before confirming
- [ ] "Place Order" creates an order record with line items and clears the cart
- [ ] Confirmation screen shows an order summary after placing
- [ ] Checkout and order creation are auth-gated; backend integration tests (order created, cart cleared) + frontend checkout/confirmation test; suite green