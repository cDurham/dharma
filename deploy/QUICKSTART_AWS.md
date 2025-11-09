# Quick Start: Deploy to AWS in 30 Minutes

This is a condensed guide to get your Dharma app deployed to AWS as quickly as possible. For detailed instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Prerequisites

- AWS account
- GitHub account with this repository
- SSH client
- 30-60 minutes

## Step 1: Create RDS Database (5 minutes)

1. Go to [AWS RDS Console](https://console.aws.amazon.com/rds/)
2. Click **Create database**
3. Quick settings:
   - Engine: **PostgreSQL 17**
   - Template: **Free tier**
   - DB identifier: `dharma-db`
   - Master username: `postgres`
   - Password: Create strong password (save it!)
   - Instance: `db.t3.micro`
   - Initial database: `dharma_db`
   - Public access: **No**
   - Create new security group: `dharma-rds-sg`
4. Click **Create database**
5. **Save**: RDS endpoint (appears after ~10 min)

## Step 2: Launch EC2 Instance (5 minutes)

1. Go to [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. Click **Launch Instance**
3. Quick settings:
   - Name: `dharma-app`
   - AMI: **Ubuntu 22.04 LTS**
   - Instance type: `t3.small`
   - Key pair: Create new → Download `.pem` file
   - Security group: Create new `dharma-ec2-sg`
     - Allow: SSH (22), HTTP (80), HTTPS (443)
   - Storage: 20GB
4. Click **Launch**
5. **Save**: Public IP address

## Step 3: Configure Security (2 minutes)

1. Go to **EC2 → Security Groups → dharma-rds-sg**
2. Edit inbound rules → Add rule:
   - Type: PostgreSQL (5432)
   - Source: `dharma-ec2-sg`
3. Save

## Step 4: Set Up EC2 (10 minutes)

```bash
# Connect to EC2
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>  # Replace with your EC2 IP

# Run setup (installs Docker, Nginx, etc.)
curl -O https://raw.githubusercontent.com/cDurham/dharma/main/deploy/ec2-setup.sh
bash ec2-setup.sh

# Configure deploy user
sudo su - deploy
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
cat ~/.ssh/github_actions  # COPY THIS for GitHub Secrets

# Clone repository
cd /opt/dharma
git clone https://github.com/cDurham/dharma.git .
chmod +x deploy/deploy.sh

# Configure nginx
exit  # Exit deploy user
sudo cp /opt/dharma/deploy/nginx.conf /etc/nginx/sites-available/dharma
sudo ln -s /etc/nginx/sites-available/dharma /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## Step 5: Configure GitHub Secrets (5 minutes)

Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

Add these 10 secrets:

```bash
# Generate secrets locally first:
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For COOKIE_SECRET
```

| Secret Name           | Value                    |
| --------------------- | ------------------------ |
| `EC2_HOST`            | Your EC2 public IP       |
| `EC2_USER`            | `deploy`                 |
| `EC2_SSH_KEY`         | Private key from Step 4  |
| `DB_HOST`             | RDS endpoint from Step 1 |
| `DB_PASSWORD`         | RDS password from Step 1 |
| `JWT_SECRET`          | Generated above          |
| `COOKIE_SECRET`       | Generated above          |
| `EMAIL_USER`          | Your email               |
| `EMAIL_USER_PASSWORD` | Email app password       |
| `FRONTEND_URL`        | `http://<EC2_IP>`        |

## Step 6: Deploy! (5 minutes)

### Option A: Automated (Recommended)

```bash
# From your local machine
git add .
git commit -m "Deploy to AWS"
git push origin main

# GitHub Actions will automatically deploy!
# Watch progress: Repository → Actions tab
```

### Option B: Manual First Deploy

```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@<EC2_IP>
sudo su - deploy
cd /opt/dharma

# Create .env file (use values from GitHub Secrets)
nano .env  # Copy from deploy/.env.production.example

# Deploy
bash deploy/deploy.sh
```

## Step 7: Verify (2 minutes)

```bash
# Check containers
docker compose -f deploy/docker-compose.prod.yml ps

# All should show "Up"
```

**Test in browser:**

- Frontend: `http://<EC2_PUBLIC_IP>`
- API: `http://<EC2_PUBLIC_IP>/graphql`

## 🎉 Done!

Your app is now live on AWS with automated deployments!

## What's Next?

### Immediate

- [ ] Seed database: `docker compose -f deploy/docker-compose.prod.yml exec api npm run api:db:seed`
- [ ] Test the application thoroughly
- [ ] Make a code change and push to test auto-deploy

### Soon

- [ ] Set up custom domain
- [ ] Install SSL certificate (Let's Encrypt)
- [ ] Configure monitoring
- [ ] Set up staging environment

### Later

- [ ] Configure CloudWatch alarms
- [ ] Set up log aggregation
- [ ] Implement auto-scaling (if needed)
- [ ] Add load balancer (if needed)

## Common Issues

### "Connection refused" when accessing app

```bash
# Check containers are running
docker compose -f deploy/docker-compose.prod.yml ps

# Check logs
docker compose -f deploy/docker-compose.prod.yml logs
```

### Can't connect to RDS

```bash
# Test from EC2
docker run --rm -it postgres:17 psql -h <RDS_ENDPOINT> -U postgres -d dharma_db

# If fails, check security groups
```

### GitHub Actions fails

1. Check Actions tab for error details
2. Verify all 10 secrets are set correctly
3. Ensure EC2_SSH_KEY includes header/footer
4. Check EC2 is accessible via SSH

## Quick Commands

```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@<EC2_IP>
sudo su - deploy
cd /opt/dharma

# View logs
docker compose -f deploy/docker-compose.prod.yml logs -f

# Restart containers
docker compose -f deploy/docker-compose.prod.yml restart

# Manual deploy
bash deploy/deploy.sh

# Rollback
git log --oneline
git reset --hard <commit-hash>
bash deploy/deploy.sh
```

## Cost

**Monthly estimate:** ~$18-43

- EC2 t3.small: ~$15-20
- RDS db.t3.micro: $0 (free tier) → $15 after 1 year
- Storage & transfer: ~$3-8

## Full Documentation

- **Complete Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Detailed Plan**: [ec2-single-instance-deployment.plan.md](ec2-single-instance-deployment.plan.md)
- **Checklist**: [.github/DEPLOYMENT_CHECKLIST.md](.github/DEPLOYMENT_CHECKLIST.md)
- **Files Reference**: [deploy/README.md](deploy/README.md)

## Support

Having issues? Check:

1. [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section
2. GitHub Actions logs
3. Docker container logs: `docker compose -f deploy/docker-compose.prod.yml logs`
4. AWS Console for resource status

---

**Time to deploy:** 30-60 minutes  
**Difficulty:** Intermediate  
**Cost:** ~$18-43/month
