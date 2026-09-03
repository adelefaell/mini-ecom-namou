# FRONTEND.md

## What I went with

React + Vite + TypeScript, with TanStack Query for server state and zustand for the small bit of client state. React Router for pages, Tailwind for styling, and Base UI components (shadcn-style wrappers) — a card here, a button there, a sheet for the cart.

The stack is deliberately boring. The interesting part of this project isn't the UI framework, it's how state moves around, and I wanted the tools for that to be the well-trodden ones.

## Pages

- `/` — product grid (15 products, title / price / variant count).
- `/products/:id` — detail: description, stock, variant picker, Add to Cart + Add to Wishlist.
- `/login` — the (only) auth screen.
- `/cart` — full cart management: quantity steppers, variant dropdown, per-line subtotals, total.
- `/wishlist` — saved items, remove, move-to-cart.
- `/checkout` — review + mocked place-order + confirmation.

## State — two kinds

**Server state = TanStack Query.** The cart, wishlist, product list, and current user are all fetched once, cached, and then mutated through React Query. Every mutation (`add`, `update`, `remove`) has optimistic updates: the UI reflects the change instantly, and rolls back if the request fails. The cart sheet and the `/cart` page read from the *same* query cache, so editing in one is instantly reflected in the other — that's the "updating state cleanly" the task cares about, and React Query gives it to me for free.

**Client state = zustand.** Just auth really: the current user and whether we're still loading them. A zustand store beats a `useContext` + `useReducer` combo for this — less boilerplate, and it's a global singleton anyway. Initializing auth (the `/me` ping on boot) happens once in a provider so every page knows "who am I" before rendering.

Component-local things (which variant is selected, whether the cart sheet is open) stay in `useState`. Forms use plain controlled inputs — `react-hook-form` is sitting in package.json but honestly there's one small form, and hand-rolled is clearer.

## Loading & empty states

Everything uses the query/mutation state directly — no hand-made `isLoading` flags.

- Lists and pages show skeleton loaders while fetching (including a skeleton while product *images* load — one of those small things that makes a page feel faster than it is).
- Buttons show a spinner from `useTransition` or the mutation's pending state.
- Empty carts/wishlists/checkouts render a proper empty-state component with a link back to the catalogue.

## UX decisions in the flow

A few non-obvious ones, all small:

- Adding to an empty cart opens a **cart sheet** on the right — confirms the add, quick steppers, "Continue Shopping" or "View Cart". After the first add it stays quiet (just the header count bumps) so a double-click doesn't pop a sheet every time.
- Removing a line from the cart or sheet when its quantity > 1 asks for confirmation in an alert dialog; a single item removes immediately.
- The header cart button opens that sheet; the `/cart` page is the full management view.
- Checkout is laid out differently from the cart page on purpose — a read-only itemized review with a sticky order summary, so it reads as a distinct step, not a cart clone.

## Why the monorepo bits

Frontend and backend share `packages/shared-types` — the zod schemas that validate API responses on the server are the same objects the frontend trusts on the way in. One definition, two sides, nothing to keep in sync by hand.