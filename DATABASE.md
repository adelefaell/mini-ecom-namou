# DATABASE.md

## What I went with

SQLite via Drizzle ORM, stored locally as a single file (`data/mini-ecom.db`). I picked SQLite because this project is small and self-contained — no server to install, no credentials to manage, and the whole "database" is one file a reviewer can poke at with any SQLite tool. A document store or in-memory array would have worked too, but I wanted something where the data shapes actually mattered (relations between products, variants, users, orders), and SQLite gives me that without any setup cost.

## Schema

Six tables:

- `products` — the catalogue items (slug, name, description, image).
- `variants` — options for a product (size, colour, etc.) with a price and a stock count.
- `users` — just enough for auth: email, name, password hash.
- `cart_items` — a user's cart, keyed by (user, variant), unique per pair so re-adding the same variant bumps its quantity instead of making a second row.
- `wishlist_items` — same idea, a saved set of (user, variant).
- `orders` + `order_items` — an order header (total, timestamp) and its line items.

Orders snapshot the product name, variant name, image, and unit price at purchase time. I did that on purpose so old orders survive later catalogue edits — an `order_items` row doesn't depend on the product still existing.

## Migrations

Schema changes live as numbered migration files under `apps/backend/drizzle/`. Drizzle generates them from the schema file (`drizzle-kit generate`) and they're applied with `drizzle-kit migrate`. I checked them into git so a fresh checkout can rebuild the exact same tables.

## Seeding

The 15 products and the demo account are seeds (`db:seed`), stored as data in the repo. The actual `.db` file is gitignored. That was a deliberate choice: seeds are part of the project (reviewable, versionable), the database file is a local byproduct. Anyone cloning the repo runs `db:migrate` then `db:seed` and gets the same catalogue and the same `demo@mini-ecom.dev` login.

The demo password is hashed with bcrypt before it's stored — pretty standard, no plaintext in the DB. (The seed file itself carries the plaintext password, which is fine for a demo but I noted in a comment that it should move to env vars if the seed ever runs somewhere shared.)

## Stock

Stock lives on the variant and is decremented/incremented inside the same transaction as the cart write, so they can't drift apart. Removing from the cart restores stock; changing a variant moves stock from one variant to the other. It's mocked-ish (no low-stock alerts or resupply) but it behaves correctly.