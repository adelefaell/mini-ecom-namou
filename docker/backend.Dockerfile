FROM node:24-bookworm
WORKDIR /app
RUN corepack enable

COPY . .

# Frozen install from the committed lockfile (workspaces: apps/*, packages/*).
# better-sqlite3 + esbuild are allowed builds; node:24-bookworm ships the C
# toolchain they need, so the native module compiles in-image.
RUN pnpm install --frozen-lockfile

ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

EXPOSE 3001

# start:prod = migrate + seed + server. Seed is idempotent (upserts), so a
# restart never duplicates rows. SQLite lives on the mounted data volume.
CMD ["sh", "-c", "cd apps/backend && pnpm start:prod"]