# My Deployment Information

## Quick Reference

**GitHub Username**: `cDurham`  
**Repository**: `https://github.com/cDurham/dharma`  
**EC2 Public IP**: `<EC2_PUBLIC_IP>`  
**RDS Instance**: Created ✅  
**EC2 Instance**: Created ✅

---

## Quick SSH Command

```bash
ssh -i dharma-key.pem ubuntu@<EC2_PUBLIC_IP>
```

---

## Setup Commands (Run on EC2)

```bash
# 1. Download setup script
curl -O https://raw.githubusercontent.com/cDurham/dharma/main/deploy/ec2-setup.sh
bash ec2-setup.sh

# 2. Configure deploy user
sudo su - deploy
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
cat ~/.ssh/github_actions  # SAVE THIS for GitHub Secrets

# 3. Clone repository
cd /opt/dharma
git clone https://github.com/cDurham/dharma.git .
chmod +x deploy/deploy.sh
exit

# 4. Configure nginx
sudo cp /opt/dharma/deploy/nginx.conf /etc/nginx/sites-available/dharma
sudo ln -s /etc/nginx/sites-available/dharma /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

## GitHub Secrets to Add

Go to: `https://github.com/cDurham/dharma/settings/secrets/actions`

| Secret Name           | Value                                    |
| --------------------- | ---------------------------------------- |
| `EC2_HOST`            | `<EC2_PUBLIC_IP>`                        |
| `EC2_USER`            | `deploy`                                 |
| `EC2_SSH_KEY`         | Private key from setup step 2            |
| `DB_HOST`             | Your RDS endpoint (from AWS RDS Console) |
| `DB_PASSWORD`         | Your RDS password                        |
| `JWT_SECRET`          | Generate: `openssl rand -base64 32`      |
| `COOKIE_SECRET`       | Generate: `openssl rand -base64 32`      |
| `EMAIL_USER`          | Your email                               |
| `EMAIL_USER_PASSWORD` | Email app password                       |
| `FRONTEND_URL`        | `http://<EC2_PUBLIC_IP>`                 |

---

## Access URLs (After Deployment)

- **Frontend**: http://<EC2_PUBLIC_IP>
- **API GraphQL**: http://<EC2_PUBLIC_IP>/graphql

---

## Common Commands

```bash
# SSH to EC2
ssh -i dharma-key.pem ubuntu@<EC2_PUBLIC_IP>

# Switch to deploy user
sudo su - deploy
cd /opt/dharma

# View logs
docker compose -f deploy/docker-compose.prod.yml logs -f

# Check container status
docker compose -f deploy/docker-compose.prod.yml ps

# Manual deploy
bash deploy/deploy.sh

# Restart containers
docker compose -f deploy/docker-compose.prod.yml restart
```

---

## Next Steps

- [ ] Commit deployment files to GitHub
- [ ] Run EC2 setup script
- [ ] Configure deploy user and SSH key
- [ ] Clone repository on EC2
- [ ] Configure nginx
- [ ] Add GitHub Secrets
- [ ] Push to main to trigger deployment
- [ ] Verify deployment works
- [ ] Set up custom domain (optional)
- [ ] Install SSL certificate (optional)
