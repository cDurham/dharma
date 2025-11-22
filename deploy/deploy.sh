#!/bin/bash
set -euo pipefail

APP_DIR="/opt/dharma"
cd "$APP_DIR"

echo "🚀 Starting deployment..."

# Ensure the image repository is lowercase for GHCR
export GITHUB_REPOSITORY="$(echo "${GITHUB_REPOSITORY:-dharma}" | tr '[:upper:]' '[:lower:]')"
TARGET_TAG="${IMAGE_TAG:-latest}"

# Pull latest code
git pull origin "${GIT_BRANCH:-trunk}"

# Create .env from environment variables (passed by GitHub Actions)
umask 077
cat > .env << EOF
# Database (RDS)
DB_HOST=${DB_HOST}
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=${DB_PASSWORD}
DB_DATABASE=dharma_db

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_ACCESS_TOKEN_EXPIRES_IN=900
JWT_ACCESS_TOKEN_MAX_AGE_MS=900000
JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS=30
JWT_REFRESH_TOKEN_MAX_AGE_MS=2592000000

# Cookie Configuration
COOKIE_SECRET=${COOKIE_SECRET}
COOKIE_ACCESS_TOKEN_MAX_AGE_MS=900000
COOKIE_REFRESH_TOKEN_MAX_AGE_MS=604800000

# Email Configuration
EMAIL_USER=${EMAIL_USER}
EMAIL_USER_PASSWORD=${EMAIL_USER_PASSWORD}

# Frontend URL
FRONTEND_URL=${FRONTEND_URL}

# Environment
NODE_ENV=production
EOF

# Check if we need to update images
CURRENT_TAG=$(docker inspect "ghcr.io/${GITHUB_REPOSITORY}/api:${TARGET_TAG}" --format='{{index .RepoDigests 0}}' 2>/dev/null || echo "none")
echo "📦 Current deployment: ${CURRENT_TAG}"
echo "📦 Target deployment: ${TARGET_TAG}"



# 1. Pull new images
echo "🐳 Pulling new images..."
docker compose -f deploy/docker-compose.prod.yml pull

# 2. Run database migrations (Fail fast)
echo "📊 Running database migrations..."
docker compose -f deploy/docker-compose.prod.yml run --rm migrator

# 3. Deploy and Wait for Health
echo "🚀 Deploying and waiting for health checks..."
# --wait implies -d and waits for healthchecks to pass
if docker compose -f deploy/docker-compose.prod.yml up --wait; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment failed! Health checks did not pass."
    docker compose -f deploy/docker-compose.prod.yml ps
    docker compose -f deploy/docker-compose.prod.yml logs --tail=200 api web migrator
    exit 1
fi

echo "🎉 Deployment complete!"
