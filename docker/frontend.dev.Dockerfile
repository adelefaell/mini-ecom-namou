# Dev-mode frontend image: same workspace install as the backend image, but no
# production `vite build`. Compose.dev.yml runs `vite` against the bind-mounted
# source, so edits hot-reload. Purpose-built so a reviewer can run the whole
# stack dev-style (`compose.dev.yml`) OR the real deploy (`compose.yml`),
# without one interfering with the other.
FROM node:24-bookworm
WORKDIR /app
RUN corepack enable

COPY . .
RUN pnpm install --frozen-lockfile

EXPOSE 3002