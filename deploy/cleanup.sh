#!/bin/bash
set -e

echo "🧹 Cleaning up old docker resources..."
# Prune dangling images, stopped containers, and unused networks
# -f forces the prune without confirmation
docker system prune -f || true

echo "✨ Cleanup complete!"
