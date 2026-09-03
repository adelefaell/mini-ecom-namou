# Mini E-Com

A small full-stack storefront: Fastify + SQLite backend, React + Vite frontend, shared Zod DTOs. Auth via JWT in an httpOnly cookie; catalogue, cart, wishlist, and a mocked checkout flow.

## Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Backend** (`apps/backend`): Fastify 5, Drizzle ORM, better-sqlite3, zod, jose (JWT), bcryptjs
- **Frontend** (`apps/frontend`): React 19, Vite, TanStack Query, React Router, Tailwind CSS 4, shadcn/ui-style Base UI components
- **Shared** (`packages/shared-types`): Zod schemas + inferred types used by both apps
- **Tests:** Vitest (backend integration, frontend component) + Playwright (e2e, optional)

## Demo account

| email | password |
| --- | --- |
| `demo@mini-ecom.dev` | `demo-password` |

## Setup

Requires Node 24 and pnpm 11.

```sh
pnpm install
```

### Run locally

```sh
pnpm dev
```

- Backend: http://localhost:3001 (Vite proxies `/api` to it)
- Frontend: http://localhost:3002

Seed the demo user and catalogue:

```sh
pnpm --filter backend db:migrate
pnpm --filter backend db:seed
```

### Run with Docker

```sh
docker compose up --build
```

Serves backend on `:3001`, frontend on `:3002`. The SQLite database persists in the `mini-ecom-data` volume. Migrations and seeding run automatically on container start.

## Scripts

| command | what |
| --- | --- |
| `pnpm dev` | run both apps in watch mode |
| `pnpm build` | typecheck + production build |
| `pnpm test` | run all Vitest suites |
| `pnpm lint` | oxlint across the repo |
| `pnpm check-types` | `tsc --noEmit` everywhere |

Backend-only helpers live in `apps/backend`: `db:generate`, `db:migrate`, `db:seed`.

## Features

- Public catalogue (list + detail with variants)
- Sign in / sign out (single demo user; JWT in httpOnly `SameSite=Lax` cookie)
- Auth-gated cart (add, quantity, change variant, remove) and wishlist (save, remove, move-to-cart)
- Checkout: review cart, place a mocked order, see confirmation
- Backend routes require auth where ownership matters; catalogue stays public

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs lint, typecheck, and tests on every push to `main`/`dev` and on pull requests.