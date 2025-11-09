#!/bin/bash
set -e

echo "🚀 Setting up EC2 instance for Dharma..."

# Update and install dependencies
echo "📦 Installing dependencies..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common git nginx

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Configure users
echo "👤 Setting up deploy user..."
sudo useradd -m -s /bin/bash deploy 2>/dev/null || echo "User 'deploy' already exists"
sudo usermod -aG docker ubuntu
sudo usermod -aG docker deploy

# Start services
sudo systemctl enable nginx && sudo systemctl start nginx

# Create app directory
sudo mkdir -p /opt/dharma
sudo chown deploy:deploy /opt/dharma

# Generate SSH keys for GitHub Actions
echo "🔑 Generating SSH keys..."
sudo -u deploy bash << 'EOF'
mkdir -p ~/.ssh && chmod 700 ~/.ssh
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys ~/.ssh/github_actions
chmod 644 ~/.ssh/github_actions.pub
EOF

EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "YOUR_EC2_IP")

echo ""
echo "✅ Setup complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 NEW SSH PRIVATE KEY (copy to GitHub Secret: EC2_SSH_KEY)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
sudo cat /home/deploy/.ssh/github_actions
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next steps: See deploy/DEPLOYMENT.md (Step 3.4 onwards)"
echo "💡 EC2_HOST for GitHub Secrets: $EC2_IP"
echo ""
