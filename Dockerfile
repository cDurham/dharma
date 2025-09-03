# syntax=docker/dockerfile:1.6

########################
# 0) Base layer
########################
FROM node:20-slim AS base
WORKDIR /usr/src

########################
# 1) Install all deps in one go (workspaces)
########################
FROM base AS deps
# Root manifests (workspaces + lockfile)
COPY package*.json ./
# Workspace manifests (so npm can resolve workspaces)
COPY backend/package.json    backend/
COPY frontend/package.json   frontend/
# Full install for building both workspaces
RUN npm ci --workspaces --include-workspace-root

##############################################
# 2) Development images (hot reload)
##############################################
FROM deps AS dev_backend
WORKDIR /usr/src
COPY backend ./backend
WORKDIR /usr/src/backend
EXPOSE 3000 9229
CMD ["npm","run","dev"]

FROM deps AS dev_frontend
WORKDIR /usr/src
COPY frontend ./frontend
WORKDIR /usr/src/frontend
EXPOSE 8080
CMD ["npm","run","dev"]

##############################################
# 3) Build artefacts (keep workspace layout)
##############################################
FROM deps AS build_backend
WORKDIR /usr/src
COPY backend ./backend
RUN npm run -w backend build

FROM deps AS build_frontend
WORKDIR /usr/src
COPY frontend ./frontend
RUN npm run -w frontend build

##############################################
# 4) Runtime images (lean)
##############################################
FROM node:20-slim AS runtime_backend
WORKDIR /app
ENV NODE_ENV=production

# App code (compiled)
COPY --from=build_backend /usr/src/backend/dist ./dist

# Copy both so nothing is missing.
COPY --from=deps /usr/src/node_modules ./node_modules
COPY --from=deps /usr/src/backend/node_modules ./node_modules

# (optional but useful) package.json for metadata / future npm operations
COPY backend/package.json ./package.json

EXPOSE 3000
CMD ["node","dist/index.js"]

FROM nginx:1.27-alpine AS runtime_frontend
COPY --from=build_frontend /usr/src/frontend/dist /usr/share/nginx/html
# nginx default entrypoint runs
