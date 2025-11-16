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

# ---------- runtime_api
FROM node:22-slim AS runtime_api
WORKDIR /app
ENV NODE_ENV=production

# Copy package.json to preserve "type": "module" for ESM
COPY --from=build_api /workspace/package.json ./

# Copy built API
COPY --from=build_api /workspace/dist/apps/api ./dist/apps/api

# Copy node_modules (includes production dependencies)
COPY --from=deps /workspace/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/apps/api/index.js"]

# ---------- runtime_web
FROM nginx:1.27-alpine AS runtime_web
COPY --from=build_web /workspace/dist/apps/web /usr/share/nginx/html
