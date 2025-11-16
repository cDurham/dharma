# syntax=docker/dockerfile:1.6

FROM node:22-slim AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /workspace

# ---------- deps (development + build dependencies)
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/ 2>/dev/null || true
COPY apps/web/package.json ./apps/web/ 2>/dev/null || true
COPY tools/cli/package.json ./tools/cli/ 2>/dev/null || true
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ---------- dev_api
FROM deps AS dev_api
COPY . .
EXPOSE 3000 9229
CMD ["pnpm", "run", "api:serve"]

# ---------- dev_web
FROM deps AS dev_web
COPY . .
EXPOSE 4200
CMD ["pnpm", "run", "web:serve"]

# ---------- build_api
FROM deps AS build_api
ARG CACHEBUST
RUN echo "Cache bust: ${CACHEBUST}"
COPY . .
RUN pnpm nx run api:build

# ---------- build_web
FROM deps AS build_web
ARG CACHEBUST
RUN echo "Cache bust: ${CACHEBUST}"
COPY . .
RUN pnpm nx run web:build

# ---------- prune_deps (production-only dependencies)
FROM deps AS prune_deps
RUN pnpm prune --prod

# ---------- runtime_api
FROM node:22-slim AS runtime_api
WORKDIR /app
ENV NODE_ENV=production

# Create minimal runtime package.json for ESM
RUN echo '{"type":"module","name":"dharma-api","version":"1.0.0"}' > package.json

# Copy built API
COPY --from=build_api /workspace/dist/apps/api ./dist/apps/api

# Copy pruned production-only node_modules
COPY --from=prune_deps /workspace/node_modules ./node_modules

# Run as non-root user
USER node

# Health check for API readiness
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/.well-known/apollo/server-health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

EXPOSE 3000
CMD ["node", "dist/apps/api/index.js"]

# ---------- runtime_web
FROM nginx:1.27-alpine AS runtime_web
COPY --from=build_web /workspace/dist/apps/web /usr/share/nginx/html
USER nginx
