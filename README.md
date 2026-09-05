# Mini E-Com

A small full-stack storefront: Fastify + SQLite backend, React + Vite frontend, shared Zod DTOs. Auth via JWT in an httpOnly cookie; catalogue, cart, wishlist, and a mocked checkout flow.

## Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Backend** (`apps/backend`): Fastify 5, Drizzle ORM, better-sqlite3, zod, jose (JWT), bcryptjs
- **Frontend** (`apps/frontend`): React 19, Vite, TanStack Query, React Router, Tailwind CSS 4, Base UI components
- **Shared** (`packages/shared-types`): Zod schemas + inferred types used by both apps
- **Tests:** Vitest (backend integration, frontend component)

## Demo account

| email | password |
| --- | --- |
| `demo@mini-ecom.dev` | `demo-password` |

## Setup

Requires **Node.js 24** and **pnpm 11**.

### Linux / macOS

1. Install prerequisites, then clone the repo:

   ```sh
   curl -fsSL https://get.pnpm.io/install.sh | sh   # or: corepack enable
   ```

   Node via your package manager or [nvm](https://github.com/nvm-sh/nvm) (use Node 24).

   ```sh
   git clone git@github.com:adelefaell/mini-ecom-namou.git mini-ecom
   cd mini-ecom
   pnpm install
   ```

2. Terminal 1 — backend (http://localhost:3001):

   ```sh
   cd apps/backend
   pnpm db:migrate && pnpm db:seed   # first run only — creates DB + demo user
   pnpm dev
   ```

3. Terminal 2 — frontend (http://localhost:3002, Vite proxies `/api` to the backend):

   ```sh
   cd apps/frontend
   pnpm dev
   ```

4. Open http://localhost:3002 and sign in with the demo account above.

Or run both at once from the repo root with Turborepo (`pnpm dev`) — same result, one terminal. Migrate + seed still once first.

### Windows

No tmux or `nohup` required — `pnpm dev` (Turborepo) starts both servers in the **one terminal window** you launch it from. Press `Ctrl+C` to stop them together.

**Recommended terminal:** [Windows Terminal](https://aka.ms/terminal) (built into Windows 11) or Git Bash.

1. **Install prerequisites** — [Node.js 24 LTS](https://nodejs.org/), then enable Corepack:
   ```sh
   corepack enable
   ```
   Fallback if Corepack is unavailable:
   ```sh
   npm install -g pnpm@11
   ```
2. **Install dependencies** (from the repo root, e.g. `cd C:\path\to\mini-ecom`):
   ```sh
   pnpm install
   ```
3. **Start the dev servers** (one command, both apps):
   ```sh
   pnpm dev
   ```
   Wait for two "ready" lines, then open http://localhost:3002. The backend runs on http://localhost:3001.
4. **First run only — create the database and demo user** (in a second terminal, keep `pnpm dev` running):
   ```sh
   pnpm --filter backend db:migrate
   pnpm --filter backend db:seed
   ```
   `better-sqlite3` ships prebuilt binaries for Windows — no build tools needed. If install ever complains about the native module, install [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022) with the "Desktop development with C++" workload and re-run `pnpm install`.

### Troubleshooting

- **Port 3002 already in use** — the dev server refuses to start (`strictPort`) instead of silently moving to 3004. Find and kill the process holding it:
  - Windows:
    ```sh
    netstat -ano | findstr :3002
    taskkill /PID <pid> /F
    ```
  - Linux/macOS:
    ```sh
    lsof -i :3002
    kill <pid>
    ```
- **`pnpm` not recognized** — the global install location may not be on your `PATH`; reopen your terminal after installing.
- **`pnpm dev` starts but frontend never becomes ready** — make sure you are running it from the repo root (`mini-ecom`), not inside `apps/frontend`.
- **Native module build error on install** — Windows: see step 4 note about Visual Studio Build Tools. Linux: ensure build tools + Python are present (`sudo apt install build-essential python3`) and re-run `pnpm install`.

## Scripts

| command | what |
| --- | --- |
| `pnpm dev` | run both apps in watch mode |
| `pnpm test` | run all Vitest suites |
| `pnpm lint` | oxlint across the repo |
| `pnpm check-types` | `tsc --noEmit` everywhere |
| `pnpm --filter frontend test:e2e` | Playwright cart-flow e2e (needs free ports 3001/3002, `pnpm exec playwright install chromium` first) |
| `./scripts/deploy.sh` | deploy `main` to the app-hub server over ssh |

Backend-only helpers live in `apps/backend`: `db:generate`, `db:migrate`, `db:seed`.

## Production deploy

`main` is the deploy branch. The server (`app-hub`) checks out `main`, builds, and runs the full stack (nginx + backend + SQLite) behind `docker compose`:

```sh
./scripts/deploy.sh
```

The deploy uses `compose.yml` (production images) and a server-side `.env`. The live app is served on http://127.0.0.1:8083. Docker is used for deployment only; local development runs via `pnpm`, as above.

## Architecture

See the domain docs written for this project:

- `DATABASE.md` — schema, migrations, seeding rationale
- `BACKEND.md` — API design, auth flow, repository/service layers
- `FRONTEND.md` — state management, data fetching, component structure
- `AI_USAGE.md` — how AI tooling was used in the development lifecycle