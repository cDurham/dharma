#!/bin/bash
set -e

APP_DIR="/opt/dharma"
cd $APP_DIR

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin trunk

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

# Kafka Configuration
KAFKA_CLIENT_ID=dharma-backend
KAFKA_BROKERS=kafka:9092

# Frontend URL
FRONTEND_URL=${FRONTEND_URL}

# Environment
NODE_ENV=production
EOF

# Build and deploy with Docker Compose
echo "🐳 Pulling and starting containers..."
docker compose -f deploy/docker-compose.prod.yml down
docker compose -f deploy/docker-compose.prod.yml pull
docker compose -f deploy/docker-compose.prod.yml up -d --force-recreate

# Wait for API to be ready with intelligent health check
echo "⏳ Waiting for API to be ready..."
for i in {1..60}; do
  if curl -f http://localhost:3000/graphql > /dev/null 2>&1; then
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
if curl -f http://localhost:3000/graphql > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
else
    echo "❌ Health check failed!"
    exit 1
fi

echo "🎉 Deployment complete!"
