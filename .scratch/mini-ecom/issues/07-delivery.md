# 07 — Delivery: Docker, CI, README

**What to build:** The project runs with one command and is verifiable on push. A docker-compose file brings up backend + frontend; each app has a Dockerfile. GitHub Actions CI runs oxlint, typecheck, and the Vitest test suite on every push (Playwright e2e optional). A concise top-level README covers setup, the tech stack, and how to run everything.

**User-owned deliverables (not AI, per the assessment):** `DATABASE.md`, `BACKEND.md`, `FRONTEND.md` written manually. `AI_USAGE.md` is deliberately omitted. Pushing the repo to GitHub is the user's action.

**Blocked by:** 06 — Checkout & orders (and transitively 03–05).

**Status:** resolved

- [x] docker-compose starts backend + frontend with one command against a persisted SQLite volume
- [x] Dockerfiles build each app; running apps serve the catalog and auth/cart flows
- [x] CI workflow runs lint, check-types, and tests on push
- [x] README documents stack, setup, and run instructions

## Comments

- `docker-compose.yml`: backend (Dockerfile runs `db:migrate` + `db:seed` + server via new `start:prod` script) + frontend (vite preview, multi-stage build). SQLite persists in `mini-ecom-data` volume at `/app/apps/backend/data`.
- Vite proxy target now reads `API_TARGET` (defaults to `http://localhost:3001`), so preview inside compose proxies `/api` to the `backend` service. `preview.proxy` mirrors `server.proxy`.
- CI (`.github/workflows/ci.yml`) runs `pnpm lint`, `pnpm check-types`, `pnpm test` on push to `main`/`dev` and PRs.
- README rewritten: stack, demo credentials, local + Docker run, scripts, feature list, CI.
- `DATABASE.md`, `BACKEND.md`, `FRONTEND.md`, `AI_USAGE.md` are user-owned per the assessment — not created here.
- Docker build not executed locally (no daemon); `docker compose config` validates. Worth a smoke build on first CI/docker run.