# CLI Examples

## Common Workflows

### Daily Development

```bash
# Start your day
npm run dharma -- dev up

# Watch API and Web logs (no Kafka noise!)
npm run dharma -- logs api-dev web-dev

# Quick status check
npm run dharma -- status

# Shell into API
npm run dharma -- exec api-dev

# End of day
npm run dharma -- dev down
```

### Fresh Start

```bash
# Nuclear option - complete reset
npm run dharma -- dev reset

# Or skip seeding
npm run dharma -- dev reset --skip-seed
```

### Working on API

```bash
# Rebuild just the API
npm run dharma -- dev rebuild api-dev

# Watch API logs
npm run dharma -- logs api-dev

# Shell into API to debug
npm run dharma -- exec api-dev sh

# Run tests inside container
npm run dharma -- exec api-dev npm test
```

### Database Operations

```bash
# Open PostgreSQL shell
npm run dharma -- db shell

# Open Drizzle Studio
npm run dharma -- db studio

# Reset database
npm run dharma -- db reset

# Just seed
npm run dharma -- db seed
```

### Interactive Mode

```bash
# No service specified? Get an interactive prompt!
npm run dharma -- logs
# → Shows checkboxes to select services

npm run dharma -- exec
# → Shows list to select which service to exec into
```

## Adding a New Service

### Example: Adding Redis

1. **Add to docker-compose.yml:**

```yaml
services:
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    networks: [app-net]
```

2. **That's it!** The CLI auto-discovers it:

```bash
npm run dharma -- status
# ✓ Redis appears in the list

npm run dharma -- logs redis
# ✓ Can view logs

npm run dharma -- exec redis redis-cli
# ✗ Won't work - no build config (not execable)
```

### Example: Adding Custom Service with Build

```yaml
services:
  worker-dev:
    profiles: ["dev"]
    build:
      context: .
      target: dev_worker
    depends_on: [db, kafka]
    networks: [app-net]
```

The CLI will automatically:
- ✅ Discover it in `status`
- ✅ Allow `logs worker-dev`
- ✅ Allow `exec worker-dev` (has build)
- ✅ Allow `dev rebuild worker-dev` (has build)
- ✅ Show dependencies in metadata

## Advanced Usage

### Multiple Services at Once

```bash
# Rebuild both API and Web
npm run dharma -- dev rebuild api-dev
npm run dharma -- dev rebuild web-dev

# Watch multiple logs
npm run dharma -- logs api-dev web-dev db
```

### Custom Log Tailing

```bash
# Last 100 lines, don't follow
npm run dharma -- logs api-dev --tail 100 --no-follow

# Follow all services
npm run dharma -- logs all
```

### Quick Iterations

```bash
# Make code changes...
npm run dharma -- dev rebuild api-dev
npm run dharma -- logs api-dev

# See the changes live!
```

## Troubleshooting

### Service Won't Start

```bash
# Check status
npm run dharma -- status

# View logs
npm run dharma -- logs api-dev --tail 100

# Nuclear option
npm run dharma -- dev reset
```

### Can't Exec Into Service

```bash
# Error: "Cannot exec into kafka - not an execable service"

# Check which services are execable:
npm run dharma -- exec
# Shows only services with build configs or known databases
```

### Database Issues

```bash
# Reset everything
npm run dharma -- db reset

# Or manually:
npm run dharma -- db shell
# DROP DATABASE dharma_db;
# CREATE DATABASE dharma_db;
# \q

npm run dharma -- db push
npm run dharma -- db seed
```

## Performance Tips

### Skip Infrastructure Logs

Instead of:
```bash
npm run dharma -- logs all  # Includes noisy Kafka/Zookeeper
```

Do:
```bash
npm run dharma -- logs api-dev web-dev  # Just what you need
```

### Quick Restart vs Rebuild

```bash
# Fast - just restart containers
npm run dharma -- dev restart

# Slow - rebuild everything from scratch
npm run dharma -- dev rebuild
```

## Integration with package.json

You can still use database commands directly:

```bash
# These work the same
npm run db:push
npm run db:seed
npm run db:studio

# Or via CLI
npm run dharma -- db push
npm run dharma -- db seed
npm run dharma -- db studio
```

