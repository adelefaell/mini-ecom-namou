FROM node:24-bookworm AS build
WORKDIR /app
RUN corepack enable

COPY . .
RUN pnpm install --frozen-lockfile

# vite build (tsc --noEmit && vite build) -> apps/frontend/dist. Vite compiles
# the shared-types source it imports; no separate shared-types build step.
RUN pnpm --filter frontend build

FROM nginx:alpine
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80