#!/bin/bash
set -e

APP_DIR="/opt/dharma"
cd $APP_DIR

echo "🚀 Starting deployment..."

# Custom health endpoint
API_HEALTH_URL="http://localhost:3000/health"

# Ensure the image repository is lowercase for GHCR
export GITHUB_REPOSITORY=$(echo "${GITHUB_REPOSITORY:-dharma}" | tr '[:upper:]' '[:lower:]')

# Pull latest code
git pull origin ${GIT_BRANCH:-trunk}

# Create .env from environment variables (passed by GitHub Actions)
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

# Run migrations on existing containers if they exist (zero-downtime)
if docker compose -f deploy/docker-compose.prod.yml ps api | grep -q "Up"; then
  echo "📊 Running database migrations on existing container..."
  docker compose -f deploy/docker-compose.prod.yml exec -T api npm run api:db:push || echo "⚠️ Migration on old container failed, will retry after deployment"
fi

# Check if we need to update images
CURRENT_TAG=$(docker inspect ghcr.io/${GITHUB_REPOSITORY}/api:latest --format='{{index .RepoDigests 0}}' 2>/dev/null || echo "none")
echo "📦 Current deployment: ${CURRENT_TAG}"
echo "📦 Target deployment: ${IMAGE_TAG:-latest}"

# Build and deploy with Docker Compose
echo "🐳 Pulling new images..."
docker compose -f deploy/docker-compose.prod.yml pull

# Only recreate if images actually changed
if docker compose -f deploy/docker-compose.prod.yml ps --quiet api web | grep -q .; then
  echo "🔄 Updating running containers..."
  docker compose -f deploy/docker-compose.prod.yml up -d --no-deps
else
  echo "🚀 Starting containers for the first time..."
  docker compose -f deploy/docker-compose.prod.yml up -d
fi

# Wait for API to be ready with intelligent health check
echo "⏳ Waiting for API to be ready..."
for i in {1..60}; do
  if curl -f "$API_HEALTH_URL" > /dev/null 2>&1; then
    echo "✅ API is ready after $i seconds"
    break
  fi
  if [ $i -eq 60 ]; then
    echo "❌ API failed to start within 60 seconds"
    docker compose -f deploy/docker-compose.prod.yml logs api
    exit 1
  fi
  sleep 1
done

# Run database migrations
echo "📊 Running database migrations..."
docker compose -f deploy/docker-compose.prod.yml exec -T api npm run api:db:push

# Final health check
echo "🏥 Running final health check..."
if curl -f "$API_HEALTH_URL" > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
else
    echo "❌ Health check failed!"
    exit 1
fi

echo "🎉 Deployment complete!"
