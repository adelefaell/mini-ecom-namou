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

Seed the demo user and catalogue (migrations must run first — the dev database starts empty):

```sh
pnpm --filter backend db:migrate
pnpm --filter backend db:seed
```

Frontend dev server binds strictly to `http://localhost:3002` (`strictPort`); if the port is taken, Vite fails loudly instead of silently moving to another port.

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

### Windows setup

No tmux or `nohup` required — `pnpm dev` (Turborepo) starts both servers in the **one terminal window** you launch it from. Press `Ctrl+C` to stop them together.

**Recommended terminal:** [Windows Terminal](https://aka.ms/terminal) (built into Windows 11) or Git Bash. PowerShell works too, but Git Bash is smoothest for the `./` path forms below.

1. **Install prerequisites**
   - [Node.js 24 LTS](https://nodejs.org/) (the installer includes npm; use `npm i -g pnpm` after, or enable Corepack — see below).
   - Enable Corepack so `pnpm` matches the pinned version:
     ```sh
     corepack enable
     ```
   - If Corepack is not available, fall back to:
     ```sh
     npm install -g pnpm@11
     ```

2. **Install dependencies** (run from the repo root, e.g. `cd C:\path\to\mini-ecom`):
   ```sh
   pnpm install
   ```

3. **Start the dev servers** (one command, both apps):
   ```sh
   pnpm dev
   ```
   Wait for two "ready" lines, then open http://localhost:3002. The backend runs on http://localhost:3001.

4. **First run only — create the database and demo user.** In a second terminal (keep `pnpm dev` running):
   ```sh
   pnpm --filter backend db:migrate
   pnpm --filter backend db:seed
   ```
   The seed uses `better-sqlite3`, which ships prebuilt binaries for Windows — no build tools (Visual Studio) needed. If install ever complains about the native module, install [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022) with the "Desktop development with C++" workload and re-run `pnpm install`.

5. **Stop everything:** press `Ctrl+C` in the terminal running `pnpm dev`.

**Troubleshooting**

- **Port 3002 already in use** — the dev server refuses to start (`strictPort`) instead of silently moving to 3004. Find and kill the process holding it:
  ```sh
  netstat -ano | findstr :3002
  taskkill /PID <pid> /F
  ```
  (Replace `<pid>` with the number from the `netstat` line.)
- **`pnpm` not recognized** — the global install location may not be on your `PATH`; reopen your terminal after installing, or run `npm i -g pnpm` from an elevated shell.
- **`pnpm dev` starts but frontend never becomes ready** — make sure you are running it from the repo root (`mini-ecom`), not inside `apps/frontend`.
- **Native module build error on install** — see step 4 note about Visual Studio Build Tools.

If Docker Desktop is installed, the Docker path (`docker compose up --build`) also works on Windows — see above.

## Features

- Public catalogue (list + detail with variants)
- Sign in / sign out (single demo user; JWT in httpOnly `SameSite=Lax` cookie)
- Auth-gated cart (add, quantity, change variant, remove) and wishlist (save, remove, move-to-cart)
- Checkout: review cart, place a mocked order, see confirmation
- Backend routes require auth where ownership matters; catalogue stays public

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs lint, typecheck, and tests on every push to `main`/`dev` and on pull requests.