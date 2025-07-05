# syntax=docker/dockerfile:1.6
########################
# 0) Base layer
########################
FROM node:20-slim AS base
WORKDIR /usr/src

# ########################
# # 1) Dependencies
# ########################
# FROM base AS deps_backend
# WORKDIR /usr/src/backend
# COPY backend/package*.json ./
# RUN npm ci

# FROM base AS deps_frontend
# WORKDIR /usr/src/frontend
# COPY frontend/package*.json ./
# RUN npm ci

########################
# 1) Install all deps in one go
########################
FROM base AS deps
COPY package*.json ./
COPY backend/package.json    backend/
COPY frontend/package.json   frontend/

# reproducible, workspace-aware install
RUN npm ci --workspaces --include-workspace-root

##############################################
# 2) Development images (hot reload)
##############################################
FROM deps AS dev_backend
COPY backend .
EXPOSE 3000 9229
CMD ["npm","run","dev"]                 # nodemon + ts-node

FROM deps AS dev_frontend
COPY frontend .
EXPOSE 8080
CMD ["npm","run","dev"]                 # webpack serve

##############################################
# 3) Build artefacts
##############################################
FROM deps AS build_backend
COPY backend .
RUN npm run build                       # → dist/

FROM deps AS build_frontend
COPY frontend .
RUN npm run build                       # → dist/

##############################################
# 4) Runtime images (lean)
##############################################
FROM node:20-slim AS runtime_backend
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build_backend   /usr/src/backend/dist         ./dist
COPY --from=deps_backend    /usr/src/backend/node_modules ./node_modules
EXPOSE 3000
CMD ["node","dist/index.js"]

FROM nginx:1.27-alpine AS runtime_frontend
COPY --from=build_frontend /usr/src/frontend/dist /usr/share/nginx/html
# keeps nginx’s default entrypoint