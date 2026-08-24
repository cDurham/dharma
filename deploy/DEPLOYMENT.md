# Deployment Guide: AWS EC2 + RDS + GitHub Actions

This guide walks you through deploying the Dharma application to AWS using EC2, RDS PostgreSQL, and GitHub Actions for automated CI/CD.

## Architecture

```
GitHub Repository (push to main)
    ↓
GitHub Actions CI/CD Pipeline
    ↓ (SSH deploy)
EC2 Instance (Docker Compose)
    ├── API Container (NestJS GraphQL - port 3000)
    ├── Web Container (React/Nginx - port 80)
    ├── Kafka Container (port 9092)
    └── Zookeeper Container (port 2181)
    ↓ (connects to)
AWS RDS PostgreSQL (managed database)
```

## Prerequisites

- AWS account
- GitHub repository with this code
- SSH client
- Basic familiarity with AWS Console, Docker, and Git

## Cost Estimate

| Service         | Configuration      | Monthly Cost      |
| --------------- | ------------------ | ----------------- |
| EC2 t3.small    | 2 vCPU, 2GB RAM    | ~$15-20           |
| RDS db.t3.micro | Free tier (1 year) | $0 (then ~$15)    |
| EBS Storage     | 20GB               | ~$2-3             |
| Data Transfer   | Minimal            | ~$1-5             |
| **Total**       |                    | **~$18-43/month** |

GitHub Actions: Free (2,000 minutes/month)

---

## Step 1: Create AWS RDS PostgreSQL Database

### 1.1 Navigate to RDS

1. Log into AWS Console
2. Go to **RDS** service
3. Click **Create database**

### 1.2 Configure Database

**Engine options:**

- Engine type: PostgreSQL
- Engine version: PostgreSQL 17
- Template: Free tier (or Dev/Test)

**Settings:**

- DB instance identifier: `dharma-db`
- Master username: `postgres`
- Master password: Create a strong password (save it securely!)

**Instance configuration:**

- DB instance class: `db.t3.micro` (free tier) or `db.t3.small`

**Storage:**

- Storage type: General Purpose SSD (gp3)
- Allocated storage: 20 GB
- Enable storage autoscaling: Yes (max 100 GB)

**Connectivity:**

- VPC: Default VPC (or create new)
- Public access: **No** (EC2 will access via private network)
- VPC security group: Create new → name it `dharma-rds-sg`
- Availability Zone: No preference

**Additional configuration:**

- Initial database name: `dharma_db`
- Backup retention period: 7 days
- Enable encryption: Yes
- Enable automated backups: Yes

### 1.3 Create Database

Click **Create database** and wait 5-10 minutes for it to be available.

### 1.4 Save RDS Details

Once created, note these details (you'll need them later):

- **Endpoint**: Found in RDS console (e.g., `dharma-db.xxxxx.us-east-1.rds.amazonaws.com`)
- **Port**: 5432
- **Database name**: `dharma_db`
- **Username**: `postgres`
- **Password**: Your master password

---

## Step 2: Launch EC2 Instance

### 2.1 Navigate to EC2

1. Go to **EC2** service
2. Click **Launch Instance**

### 2.2 Configure Instance

**Name and tags:**

- Name: `dharma-app`

**Application and OS Images:**

- AMI: Ubuntu Server 22.04 LTS (free tier eligible)

**Instance type:**

- Type: `t3.small` (minimum) or `t3.medium` (recommended)

**Key pair:**

- Create new key pair or select existing
- Key pair name: `dharma-key` (or your choice)
- Key pair type: RSA
- Private key format: .pem
- **Download the .pem file and save it securely!**

**Network settings:**

- VPC: Same VPC as RDS
- Auto-assign public IP: Enable
- Firewall (security groups): Create new security group
  - Security group name: `dharma-ec2-sg`
  - Description: Security group for Dharma app server

**Security group rules:**
Add these inbound rules:

1. SSH
   - Type: SSH
   - Port: 22
   - Source: My IP (your current IP address)
2. HTTP
   - Type: HTTP
   - Port: 80
   - Source: Anywhere (0.0.0.0/0)
3. HTTPS
   - Type: HTTPS
   - Port: 443
   - Source: Anywhere (0.0.0.0/0)
4. Custom TCP (optional - for direct API access)
   - Type: Custom TCP
   - Port: 3000
   - Source: Anywhere (0.0.0.0/0)

**Configure storage:**

- Size: 20 GB
- Volume type: gp3

### 2.3 Launch Instance

Click **Launch instance** and wait for it to start.

### 2.4 Update RDS Security Group

1. Go to **EC2 → Security Groups**
2. Find `dharma-rds-sg`
3. Click **Edit inbound rules**
4. Add rule:
   - Type: PostgreSQL
   - Port: 5432
   - Source: Custom → Select `dharma-ec2-sg`
   - Description: "Allow PostgreSQL from EC2"
5. Save rules

---

## Step 3: Set Up EC2 Instance

### 3.1 Connect to EC2

```bash
# Make key file private
chmod 400 dharma-key.pem

# Connect via SSH (replace with your EC2 public IP)
ssh -i dharma-key.pem ubuntu@<EC2_PUBLIC_IP>  # Your EC2 IP
```

### 3.2 Run Setup Script

```bash
# Download and run the setup script
curl -O https://raw.githubusercontent.com/cDurham/dharma/main/deploy/ec2-setup.sh
bash ec2-setup.sh
```

This script will:

- Update system packages
- Install Docker and Docker Compose
- Install Nginx
- Install Git
- Create a `deploy` user
- Create `/opt/dharma` directory
- Generate SSH keys for GitHub Actions
- Configure GitHub Container Registry (GHCR) authentication

**During the script, you'll be prompted for:**
1. **GitHub username** - Your GitHub account username
2. **GitHub Personal Access Token (PAT)** - Create one at https://github.com/settings/tokens/new with `read:packages` scope

**The script will output:**
- The SSH private key to copy to GitHub Secrets (EC2_SSH_KEY)

> **Note**: If you skip the GHCR setup during the script, you can configure it later by following `deploy/EC2_SETUP.md`

### 3.3 Clone Repository

```bash
# Switch back to deploy user
sudo su - deploy
cd /opt/dharma

# Clone your repository
git clone https://github.com/cDurham/dharma.git .

# Make deploy script executable
chmod +x deploy/deploy.sh

# Exit deploy user
exit
```

### 3.4 Configure Nginx

```bash
# Copy nginx configuration
sudo cp /opt/dharma/deploy/nginx.conf /etc/nginx/sites-available/dharma

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/dharma /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

## Step 4: Configure GitHub Secrets

### 4.1 Navigate to Repository Settings

1. Go to your GitHub repository
2. Click **Settings**
3. Go to **Secrets and variables → Actions**
4. Click **New repository secret**

### 4.2 Add Required Secrets

Add each of these secrets:

| Secret Name           | Value                 | How to Get It                                      |
| --------------------- | --------------------- | -------------------------------------------------- |
| `EC2_HOST`            | EC2 public IP address | AWS EC2 Console → Instance details                 |
| `EC2_USER`            | `deploy`              | Fixed value                                        |
| `EC2_SSH_KEY`         | Private SSH key       | Output from Step 3.3 (`cat ~/.ssh/github_actions`) |
| `DB_HOST`             | RDS endpoint          | AWS RDS Console → Database details                 |
| `DB_PASSWORD`         | RDS master password   | Password you created in Step 1.2                   |
| `JWT_SECRET`          | Random string         | Generate: `openssl rand -base64 32`                |
| `COOKIE_SECRET`       | Random string         | Generate: `openssl rand -base64 32`                |
| `EMAIL_USER`          | Email address         | Your email service username                        |
| `EMAIL_USER_PASSWORD` | Email password        | App-specific password for email                    |
| `FRONTEND_URL`        | Frontend URL          | `http://<EC2_PUBLIC_IP>` or your domain            |

**Important Notes:**

- For `EC2_SSH_KEY`: Copy the entire private key including the header and footer lines
- Generate strong secrets for `JWT_SECRET` and `COOKIE_SECRET`
- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) for `EMAIL_USER_PASSWORD`

---

## Step 5: Initial Deployment

### 5.1 Test RDS Connection from EC2

```bash
# SSH to EC2
ssh -i dharma-key.pem ubuntu@<EC2_PUBLIC_IP>

# Test PostgreSQL connection (replace with your RDS endpoint)
docker run --rm -it postgres:17 psql -h <RDS_ENDPOINT> -U postgres -d dharma_db
# Enter your RDS password when prompted
# If successful, you'll see the psql prompt
# Type \q to exit
```

### 5.2 Manual First Deployment

```bash
# Switch to deploy user
sudo su - deploy
cd /opt/dharma

# Create .env file manually for first deployment
cat > .env << 'EOF'
# Replace these values with your actual values
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_rds_password
DB_DATABASE=dharma_db

JWT_SECRET=your_jwt_secret
JWT_ACCESS_TOKEN_EXPIRES_IN=900
JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS=30

COOKIE_SECRET=your_cookie_secret

EMAIL_USER=your_email@example.com
EMAIL_USER_PASSWORD=your_email_password

KAFKA_CLIENT_ID=dharma-backend
KAFKA_BROKERS=kafka:9092

FRONTEND_URL=http://your-ec2-ip

NODE_ENV=production
EOF

# Run deployment script
bash deploy/deploy.sh
```

This will:

1. Build Docker images
2. Start all containers
3. Run database migrations
4. Perform health check

### 5.3 Verify Deployment

```bash
# Check containers are running
docker compose -f deploy/docker-compose.prod.yml ps

# Check logs
docker compose -f deploy/docker-compose.prod.yml logs -f api
# Press Ctrl+C to exit logs

# Test API
curl http://localhost:3000/graphql
# Should return GraphQL response

# Test frontend (from your local machine)
# Open browser: http://<EC2_PUBLIC_IP>
```

### 5.4 Seed Database (Optional)

```bash
# Still as deploy user
docker compose -f deploy/docker-compose.prod.yml exec api npm run api:db:seed
```

---

## Step 6: Enable Automated Deployments

### 6.1 Commit and Push

From your local machine:

```bash
# Ensure all deployment files are committed
git status

# If there are uncommitted changes
git add .
git commit -m "Add AWS deployment configuration"

# Push to main branch
git push origin main
```

### 6.2 Verify GitHub Actions

1. Go to your GitHub repository
2. Click **Actions** tab
3. You should see a workflow run for "Deploy to EC2"
4. Click on it to view progress
5. Wait for it to complete (green checkmark)

### 6.3 Test Automated Deployment

```bash
# Make a small change to test
echo "# Test deployment" >> README.md
git add README.md
git commit -m "Test automated deployment"
git push origin main

# Watch GitHub Actions deploy automatically
```

---

## Step 7: Post-Deployment Configuration

### 7.1 Set Up Domain (Optional)

If you have a domain name:

1. **Point DNS to EC2:**
   - Add an A record pointing to your EC2 public IP
   - Wait for DNS propagation (5-30 minutes)

2. **Update nginx configuration:**

   ```bash
   ssh -i dharma-key.pem ubuntu@<EC2_PUBLIC_IP>
   sudo nano /etc/nginx/sites-available/dharma
   # Change "server_name _;" to "server_name yourdomain.com;"
   sudo nginx -t
   sudo systemctl reload nginx
   ```

3. **Update GitHub Secret:**
   - Update `FRONTEND_URL` to `https://yourdomain.com`

### 7.2 Set Up SSL with Let's Encrypt

```bash
# SSH to EC2
ssh -i dharma-key.pem ubuntu@<EC2_PUBLIC_IP>

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com

# Certbot will automatically update nginx config
# Follow the prompts

# Test auto-renewal
sudo certbot renew --dry-run
```

### 7.3 Set Up Monitoring (Optional)

Consider setting up:

- AWS CloudWatch for EC2 and RDS monitoring
- Uptime monitoring (e.g., UptimeRobot, Pingdom)
- Log aggregation (e.g., CloudWatch Logs, Papertrail)

---

## Ongoing Operations

### Deploy New Changes

```bash
# Just push to main branch
git add .
git commit -m "Your changes"
git push origin main

# GitHub Actions automatically deploys!
```

### View Logs

```bash
# GitHub Actions logs
# Go to: Repository → Actions → Latest workflow run

# Application logs (SSH to EC2)
ssh -i dharma-key.pem ubuntu@<EC2_PUBLIC_IP>
sudo su - deploy
cd /opt/dharma
docker compose -f deploy/docker-compose.prod.yml logs -f
```

### Rollback to Previous Version

```bash
# SSH to EC2
ssh -i dharma-key.pem ubuntu@<EC2_PUBLIC_IP>
sudo su - deploy
cd /opt/dharma

# View commit history
git log --oneline

# Rollback to specific commit
git reset --hard <commit-hash>

# Redeploy
bash deploy/deploy.sh
```

### Database Backup

RDS automatically backs up daily. To create manual snapshot:

1. Go to AWS RDS Console
2. Select your database
3. Actions → Take snapshot
4. Name it and create

### Scale Up

If you need more resources:

1. **EC2**: Stop instance → Change instance type → Start instance
2. **RDS**: Modify instance → Change instance class → Apply immediately

---

## Troubleshooting

### Deployment Fails

```bash
# Check GitHub Actions logs first
# Then SSH to EC2 and check logs
ssh -i dharma-key.pem ubuntu@<EC2_PUBLIC_IP>
sudo su - deploy
cd /opt/dharma
docker compose -f deploy/docker-compose.prod.yml logs
```

### Can't Connect to RDS

```bash
# Test from EC2
docker run --rm -it postgres:17 psql -h <RDS_ENDPOINT> -U postgres -d dharma_db

# If fails, check:
# 1. RDS security group allows EC2 security group
# 2. RDS is in same VPC as EC2
# 3. Password is correct
```

### Containers Won't Start

```bash
# Check Docker logs
docker compose -f deploy/docker-compose.prod.yml logs api

# Check environment variables
docker compose -f deploy/docker-compose.prod.yml exec api env | grep DB

# Rebuild containers
docker compose -f deploy/docker-compose.prod.yml down
docker compose -f deploy/docker-compose.prod.yml build --no-cache
docker compose -f deploy/docker-compose.prod.yml up -d
```

### Out of Disk Space

```bash
# Clean up Docker
docker system prune -a --volumes

# Check disk usage
df -h

# Consider increasing EBS volume size in AWS Console
```

### API Not Responding

```bash
# Check if container is running
docker compose -f deploy/docker-compose.prod.yml ps

# Check API logs
docker compose -f deploy/docker-compose.prod.yml logs api

# Restart API container
docker compose -f deploy/docker-compose.prod.yml restart api
```

---

## Security Best Practices

1. **Restrict SSH access**: Update EC2 security group to only allow SSH from your IP
2. **Use strong passwords**: For RDS and all secrets
3. **Enable MFA**: On your AWS account
4. **Regular updates**: Keep EC2 packages updated
5. **Monitor access**: Check AWS CloudTrail logs
6. **Rotate secrets**: Periodically update JWT_SECRET, COOKIE_SECRET
7. **Use SSL**: Set up HTTPS with Let's Encrypt
8. **Backup regularly**: Test RDS restore procedures

---

## Support

For issues or questions:

- Check the main [README.md](README.md)
- Review the detailed plan: [ec2-single-instance-deployment.plan.md](ec2-single-instance-deployment.plan.md)
- Check GitHub Actions logs
- Review Docker container logs

---

## Summary

You now have:

- ✅ Production-ready deployment on AWS
- ✅ Managed PostgreSQL database with automated backups
- ✅ Automated CI/CD pipeline with GitHub Actions
- ✅ Scalable architecture
- ✅ Secure configuration with secrets management
- ✅ Easy rollback capabilities

**Next Steps:**

1. Set up a custom domain
2. Enable SSL with Let's Encrypt
3. Configure monitoring and alerts
4. Set up staging environment (optional)
5. Document your specific configuration
