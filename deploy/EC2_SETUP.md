# GitHub Container Registry (GHCR) Reference

## Overview

The deployment pipeline builds Docker images in GitHub Actions and pushes them to GitHub Container Registry (GHCR). Your EC2 instance pulls these pre-built images instead of building from scratch.

## Automated Setup

GHCR authentication is **automatically configured** when you run `deploy/ec2-setup.sh`. The script will:

1. Prompt for your GitHub username
2. Prompt for a GitHub Personal Access Token (PAT) with `read:packages` scope
3. Configure Docker to authenticate with GHCR

## Manual Setup (if needed)

If you need to reconfigure GHCR authentication or skipped it during initial setup:

### 1. Create a GitHub Personal Access Token (PAT)

1. Go to: https://github.com/settings/tokens/new
2. Give it a descriptive name like "EC2 GHCR Pull Access"
3. Select the following scope:
   - `read:packages` - Download packages from GitHub Package Registry
4. Click "Generate token"
5. **Copy the token immediately** (you won't be able to see it again)

### 2. Login to GHCR on EC2

SSH into your EC2 instance and run:

```bash
docker login ghcr.io -u YOUR_GITHUB_USERNAME -p YOUR_PAT_TOKEN
```

You should see:

```
Login Succeeded
```

### 3. Verify the Setup

Test pulling an image:

```bash
docker pull ghcr.io/YOUR_ORG/YOUR_REPO/api:latest
```

If authentication is successful, it will attempt to pull (may fail if no image exists yet, but won't show auth errors).

## Verification

After your first deployment with the new pipeline:

1. Check that images are published in GitHub:
   - Go to your repository on GitHub
   - Click on "Packages" in the right sidebar
   - You should see `api` and `web` packages

2. On EC2, verify the deployment pulled images:
   ```bash
   docker images | grep ghcr.io
   ```

You should see your API and web images listed.

## Troubleshooting

### "unauthorized: authentication required"

- Your PAT token may have expired or lacks the `read:packages` scope
- Re-create the token with proper permissions and login again

### "denied: permission_denied"

- The repository may be private and your PAT doesn't have access
- Ensure the PAT is from an account with read access to the repository

### Images not found

- The first deployment may not have completed yet
- Check GitHub Actions logs to ensure images were pushed successfully
- Verify package visibility settings in GitHub (should be public or accessible to your account)

## Security Notes

- The Docker login credentials are stored in `~/.docker/config.json` on EC2
- Keep your PAT secure and rotate it periodically
- Use the minimum required scope (`read:packages` only)
- Consider using GitHub App tokens for production environments for better security and auditability
