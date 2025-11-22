# syntax=docker/dockerfile:1.6

# ---------- base
FROM node:22-slim AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /workspace

# ---------- deps (workspace install with cache)
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy per-project manifests so pnpm can resolve workspace graph without copying the whole repo yet
# (only tools/cli has its own package.json; apps live under the root package)
RUN mkdir -p tools/cli apps/api apps/web
COPY tools/cli/package.json ./tools/cli/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ---------- dev targets
FROM deps AS dev_api
COPY . .
EXPOSE 3000 9229
CMD ["pnpm", "run", "api:serve"]

FROM deps AS dev_web
COPY . .
EXPOSE 4200
CMD ["pnpm", "run", "web:serve"]

# ---------- build (build both apps together for maximal cache reuse)
FROM deps AS build
COPY . .
# Persist Nx cache across Docker builds
RUN --mount=type=cache,target=/workspace/.nx/cache \
    pnpm nx run-many -t build --projects=api,web

# ---------- prune (production-only dependencies)
FROM deps AS prune
RUN pnpm --filter=api --prod deploy /deploy/api

# ---------- migrations
FROM deps AS migrations
COPY . .
CMD ["pnpm", "run", "db:push"]

# ---------- runtime_migrator (alias for consistency with CI)
FROM migrations AS runtime_migrator

# ---------- runtime_api
FROM node:22-slim AS runtime_api
WORKDIR /app
ENV NODE_ENV=production

# Copy built API
COPY --from=build /workspace/dist/apps/api ./dist/apps/api

# Copy pruned production-only node_modules and package.json from deploy
COPY --from=prune /deploy/api/node_modules ./node_modules
COPY --from=prune /deploy/api/package.json ./package.json

# Run as non-root user
USER node

EXPOSE 3000
CMD ["node", "dist/apps/api/src/index.js"]

# ---------- runtime_web
FROM nginx:1.27-alpine AS runtime_web
COPY --from=build /workspace/dist/apps/web /usr/share/nginx/html
