# BACKEND.md

## What I went with

Node.js + Fastify + TypeScript. The task said Express or "a better alternative", and I think Fastify counts — it's faster, has built-in schema/validation hooks, and the plugin model keeps the routes tidy. TypeScript everywhere on the server because this is the kind of project where a typo in a payload is a runtime bug nobody enjoys debugging.

The API is REST-ish under `/api`: products (public), auth, cart, wishlist, orders (all behind auth).

## Auth

JWT in an httpOnly `SameSite=Lax` cookie. No refresh tokens — the task asked for a "simple login screen", so I kept it to exactly that scope: login issues a token, `GET /api/auth/me` returns the current user, logout clears the cookie.

The cookie being httpOnly means the token never touches JavaScript — no XSS exfiltration of the session, which felt like the right default even for a demo. Passwords are bcrypt-hashed (`demo-password` is hashed, never stored raw).

Route protection is one small `requireAuth` preHandler that reads the cookie, verifies the JWT, and attaches the user to the request. Cart, wishlist, and order creation all register with that hook so you can't touch a cart without a session. The catalogue deliberately stays public — browsing shouldn't need to be logged in.

## Layout

Each feature gets three thin layers:

- `routes/` — HTTP: parse + validate the request (zod), call the service, map errors to status codes.
- `services/` — the use case: "add this variant to the cart", the rules (stock check) live here.
- `repositories/` — SQL. The route/service layer never touches Drizzle directly.

It's more files, but each file stays boring. For a shop growing in the direction of "repositories become the data access API", this gives somewhere to go without a rewrite.

## The interesting bits

**Validation.** Zod guards every request body and route param. Bad input is a clean `400` instead of a crash. The same schemas live in `packages/shared-types`, which the frontend also imports — one source of truth for what a product or cart looks like, so the two sides can't silently disagree.

**Cart writes are transactional.** Adding to the cart, changing quantity, switching variant, and removing all run in a SQLite transaction, and each one adjusts stock atomically. The "stock impossible: tried to buy more than exists" case returns `409` and writes nothing.

**Orders.** Placing an order reads the cart, snapshots it into `orders`/`order_items`, and clears the cart — all in one transaction, so you never get an order with no items or a cart that half-clears.

## Error handling

One Fastify error handler at the app root: zod errors → 400 with the field issues, everything else → its status code or 500. Routes mostly just throw; the mapping happens in one place.

## Env

Config via zod-validated env (`HOST`, `PORT`, `DATABASE_URL`, `JWT_SECRET`). Defaults are safe for local dev; `JWT_SECRET` has a dev fallback but is meant to be overridden. Real secrets would come from env in any real deployment.