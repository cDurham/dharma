# Deployment Optimization Guide

This document explains the deployment optimizations implemented to reduce deployment time from **20+ minutes to 3-8 minutes**.

## 🎯 Summary of Improvements

| Optimization | Impact | Time Saved | Status |
|-------------|---------|-----------|---------|
| **Parallel Docker Builds** | High | 5-8 min | ✅ Active |
| **Intelligent Health Checks** | Medium | 1-3 min | ✅ Active |
| **Production Dependencies Only** | Medium | 3-5 min | ✅ Active |
| **Optimized Migration Timing** | Low | 1-2 min | ✅ Active |
| **Removed Kafka Dependency** | Medium | 2-4 min | ✅ Active |
| **SHA-Based Image Tags** | High | 5-10 min* | ✅ Active |
| **Pre-built Base Images** | Very High | 10-15 min** | ✅ Optional |

*\* On no-code-change deployments*  
*\*\* When base images are used*

---

## Quick Wins (Already Active)

### 1. Parallel Docker Builds ⚡
**What it does:** Builds API and Web images simultaneously instead of sequentially.

**Implementation:**
```yaml
# .github/workflows/deploy.yml
strategy:
  matrix:
    service: [api, web]  # Runs both in parallel
```

**Before:** API build → API push → Web build → Web push (sequential)  
**After:** Both build and push at the same time

---

### 2. Intelligent Health Checks 🔍
**What it does:** Polls API readiness every second instead of blindly waiting 10 seconds.

**Implementation:**
```bash
# deploy/deploy.sh
for i in {1..60}; do
  if curl -f http://localhost:3000/graphql > /dev/null 2>&1; then
    echo "✅ API is ready after $i seconds"
    break
  fi
  sleep 1
done
```

**Before:** Always waits 10 seconds (even if ready in 3)  
**After:** Exits as soon as API responds (usually 3-5 seconds)

---

### 3. Production Dependencies Only 📦
**What it does:** Runtime API image only includes production dependencies, not dev tools.

**Implementation:**
```dockerfile
# Dockerfile
FROM base AS deps-prod
COPY package*.json ./
RUN npm ci --only=production  # No TypeScript, Jest, etc.
```

**Before:** 500MB+ image with all dev dependencies  
**After:** ~200MB image with only runtime dependencies

---

### 4. Optimized Migration Timing ⏱️
**What it does:** Runs migrations on old container before swapping, reducing downtime.

**Implementation:**
```bash
# deploy/deploy.sh
if docker compose ps api | grep -q "Up"; then
  echo "📊 Running migrations on existing container..."
  docker compose exec -T api npm run api:db:push
fi
docker compose pull
docker compose up -d --force-recreate
```

**Before:** Stop → Pull → Start → Wait → Migrate  
**After:** Migrate → Pull → Swap (near-zero downtime)

---

### 5. Kafka Not in Critical Path 🚀
**What it does:** API starts immediately without waiting for Kafka to be healthy.

**Implementation:**
```yaml
# deploy/docker-compose.prod.yml
api:
  # Removed: depends_on: kafka: { condition: service_healthy }
  ports: [3000:3000]
```

**Before:** Wait for Zookeeper → Wait for Kafka health check → Start API  
**After:** Start API immediately (Kafka connects in background)

---

### 6. SHA-Based Image Tags 🏷️
**What it does:** Tags images with Git SHA, enabling smart deployment decisions.

**Implementation:**
```yaml
# .github/workflows/deploy.yml
tags: |
  ghcr.io/${{ repo }}/api:${{ github.sha }}
  ghcr.io/${{ repo }}/api:latest
```

```bash
# deploy/deploy.sh
echo "📦 Current: ${CURRENT_TAG}"
echo "📦 Target: ${IMAGE_TAG}"
docker compose up -d --no-deps  # Only restart if changed
```

**Before:** Always pulls and recreates containers  
**After:** Smart detection - skips if no changes

---

## Advanced Optimization (Optional)

### 7. Pre-built Base Images 🚄

**What it does:** Pre-builds an image with all `node_modules` installed, so app builds just copy code.

#### How It Works

1. **Base Image Workflow** (`.github/workflows/build-base-image.yml`)
   - Triggers on `package.json` or `package-lock.json` changes
   - Builds images with all dependencies pre-installed
   - Pushes to `ghcr.io/<repo>/dharma-base:latest`
   - Tagged with hash of `package-lock.json` for caching

2. **Fast Dockerfile** (`Dockerfile.fast`)
   - Uses pre-built base images instead of running `npm ci`
   - Skips the slowest part of the build (15+ minutes)

3. **Automatic Detection**
   - Deploy workflow checks if base images exist
   - Uses `Dockerfile.fast` if available
   - Falls back to regular `Dockerfile` if not

#### Setup (One-Time)

**Option 1: Manual Trigger**
1. Go to **Actions** → **Build Base Image**
2. Click **Run workflow**
3. Wait 10-15 minutes for first build
4. Future deploys automatically use it

**Option 2: Automatic (on next dependency change)**
1. Just update `package.json` or `package-lock.json`
2. Commit and push to `trunk`
3. Base image workflow runs automatically
4. Next deploy uses the new base image

#### Maintenance

Base images are rebuilt automatically when:
- `package.json` changes
- `package-lock.json` changes
- `Dockerfile.base` changes

**Manual rebuild:**
```bash
# Trigger the workflow manually via GitHub Actions UI
# or push a commit that touches package.json
```

#### File Overview

| File | Purpose |
|------|---------|
| `Dockerfile` | Standard build (works everywhere) |
| `Dockerfile.fast` | Optimized build using base images |
| `Dockerfile.base` | Builds base images with dependencies |
| `.github/workflows/build-base-image.yml` | Builds base images on dependency changes |
| `.github/workflows/deploy.yml` | Auto-selects fast or standard build |

---

## Expected Performance

### Without Base Images (Standard)
- **First time:** ~12-18 minutes
- **Code changes:** ~8-12 minutes
- **No changes (config only):** ~5-8 minutes

### With Base Images (Optimized)
- **First time (building base):** ~15-20 minutes (one-time)
- **After base exists:**
  - **Code changes:** ~3-5 minutes ⚡
  - **No changes:** ~2-3 minutes ⚡⚡
  - **Dependency changes:** ~15 minutes (rebuilds base)

---

## Troubleshooting

### Deployment still slow?

**Check which Dockerfile is being used:**
```bash
# In GitHub Actions logs, look for:
"✅ Base images found - using optimized Dockerfile.fast"
# or
"⚠️ Base images not found - using standard Dockerfile"
```

**If using standard Dockerfile:**
1. Run the "Build Base Image" workflow manually
2. Wait for it to complete
3. Next deployment will be much faster

### Base images outdated?

**Symptoms:**
- Builds fail with module not found
- Dependency errors

**Solution:**
```bash
# Option 1: Rebuild base images manually
# Go to Actions → Build Base Image → Run workflow

# Option 2: Add a commit to package.json
# This triggers automatic base image rebuild
```

### Want to disable base image optimization?

**Temporarily:**
```yaml
# In .github/workflows/deploy.yml, change:
file: ${{ steps.check_base.outputs.use_fast == 'true' && './Dockerfile.fast' || './Dockerfile' }}
# To:
file: ./Dockerfile
```

**Permanently:**
Delete `Dockerfile.fast` and `.github/workflows/build-base-image.yml`

---

## Monitoring Deployment Performance

**GitHub Actions:**
- Go to **Actions** → **Deploy to EC2**
- Check timing of each step
- Look for the "Build and push" job duration

**Expected timings:**
```
✅ Checkout: ~5s
✅ Login: ~2s
✅ Build (with base): ~2-3 min
✅ Build (without base): ~8-12 min
✅ Deploy: ~2-3 min
✅ Total (with base): ~5-8 min
✅ Total (without base): ~12-18 min
```

---

## Best Practices

1. **Always run base image build after updating dependencies**
   - This happens automatically, but verify it completes

2. **Monitor GitHub Actions for failures**
   - Base image builds are important for performance

3. **Use SHA tags for rollbacks**
   ```bash
   # On EC2
   export IMAGE_TAG=abc1234  # Previous good commit
   bash deploy/deploy.sh
   ```

4. **Keep Kafka running in background**
   - It's no longer blocking, but still useful for events

5. **Monitor deployment times**
   - If they increase, check if base images are stale

---

## Future Optimizations (Not Implemented)

### Potential Additional Improvements

1. **Multi-region registry mirrors** - Reduce pull times
2. **Persistent build cache** - Share cache across builds
3. **Blue-green deployments** - True zero-downtime
4. **Incremental builds** - Only rebuild changed packages
5. **Build artifacts cache** - Reuse compiled TypeScript

---

## Questions?

See the main [DEPLOYMENT.md](DEPLOYMENT.md) for general deployment information.

For issues with optimizations specifically, check:
- GitHub Actions logs
- Docker image registry (ghcr.io)
- EC2 deployment logs (`docker compose logs`)

