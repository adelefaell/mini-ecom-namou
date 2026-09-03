# 01 — Monorepo restructure & tooling baseline

**What to build:** The repo reshaped for the real stack: a Fastify backend, a Vite + React frontend, and a shared-types package, with oxlint, Vitest, Playwright, Tailwind and shadcn/ui wired in. Boilerplate Next.js apps removed. `pnpm dev` runs both apps and the full lint/typecheck/test suite is green on an empty shell.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] Scaffold backend + frontend + shared-types packages
- [x] Wire oxlint, Vitest, Playwright, Tailwind + shadcn (Base UI/Nova)
- [x] Root turbo tasks: build, lint, check-types, test all green