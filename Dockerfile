# syntax=docker/dockerfile:1.6

FROM node:22-slim AS base
WORKDIR /workspace

FROM base AS deps
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --legacy-peer-deps

FROM base AS deps-prod
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production --prefer-offline --legacy-peer-deps

FROM deps AS dev_api
COPY . .
EXPOSE 3000 9229
CMD ["npm", "run", "api:serve"]

FROM deps AS dev_web
COPY . .
EXPOSE 4200
CMD ["npm", "run", "web:serve"]

FROM deps AS build_api
ARG CACHEBUST
RUN echo "Cache bust: ${CACHEBUST}"
COPY . .
RUN npm run api:build

FROM deps AS build_web
ARG CACHEBUST
RUN echo "Cache bust: ${CACHEBUST}"
COPY . .
RUN npm run web:build

FROM node:22-slim AS runtime_api
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build_api /workspace/dist/apps/api ./dist/apps/api
COPY --from=deps-prod /workspace/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/apps/api/index.js"]

FROM nginx:1.27-alpine AS runtime_web
COPY --from=build_web /workspace/dist/apps/web /usr/share/nginx/html
