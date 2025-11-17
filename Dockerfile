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
RUN mkdir -p tools/cli
COPY tools/cli/package.json ./tools/cli/package.json
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
RUN pnpm prune --prod
# (Optional, smaller: with pnpm >= 8.9)
# RUN pnpm --filter ./apps/api... deploy --prod /workspace/deploy/api

# ---------- runtime_api
FROM node:22-slim AS runtime_api
WORKDIR /app
ENV NODE_ENV=production

# Minimal runtime package.json for ESM semantics
RUN printf '{"name":"dharma-api","type":"module","private":true}\n' > package.json

# Copy built API
COPY --from=build /workspace/dist/apps/api ./dist/apps/api

# Copy pruned production-only node_modules
COPY --from=prune /workspace/node_modules ./node_modules
# If you used the optional pnpm deploy above, prefer:
# COPY --from=prune /workspace/deploy/api/node_modules ./node_modules

# Run as non-root user
USER node

# Health check for API readiness (update path if you change servers)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/.well-known/apollo/server-health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

EXPOSE 3000
CMD ["node", "dist/apps/api/src/index.js"]

# ---------- runtime_web
FROM nginx:1.27-alpine AS runtime_web
COPY --from=build /workspace/dist/apps/web /usr/share/nginx/html
USER nginx
