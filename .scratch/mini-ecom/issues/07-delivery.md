# 07 — Delivery: Docker, CI, README

**What to build:** The project runs with one command and is verifiable on push. A docker-compose file brings up backend + frontend; each app has a Dockerfile. GitHub Actions CI runs oxlint, typecheck, and the Vitest test suite on every push (Playwright e2e optional). A concise top-level README covers setup, the tech stack, and how to run everything.

**User-owned deliverables (not AI, per the assessment):** `DATABASE.md`, `BACKEND.md`, `FRONTEND.md` written manually. `AI_USAGE.md` is deliberately omitted. Pushing the repo to GitHub is the user's action.

**Blocked by:** 06 — Checkout & orders (and transitively 03–05).

**Status:** ready-for-agent

- [ ] docker-compose starts backend + frontend with one command against a persisted SQLite volume
- [ ] Dockerfiles build each app; running apps serve the catalog and auth/cart flows
- [ ] CI workflow runs lint, check-types, and tests on push
- [ ] README documents stack, setup, and run instructions