#!/bin/bash
set -e

echo "🚀 Setting up EC2 instance for Dharma deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Install git if not present
sudo apt install -y git

# Create deployment user
echo "👤 Creating deployment user..."
sudo useradd -m -s /bin/bash deploy || echo "User 'deploy' already exists"
sudo usermod -aG docker deploy

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/dharma
sudo chown deploy:deploy /opt/dharma

echo ""
echo "✅ EC2 setup complete!"
echo ""
echo "Next steps:"
echo "1. Switch to deploy user: sudo su - deploy"
echo "2. Generate SSH key for GitHub Actions:"
echo "   ssh-keygen -t ed25519 -C 'github-actions' -f ~/.ssh/github_actions -N ''"
echo "   cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys"
echo "   chmod 600 ~/.ssh/authorized_keys"
echo "3. Copy private key for GitHub Secrets:"
echo "   cat ~/.ssh/github_actions"
echo "4. Clone repository to /opt/dharma"
echo "5. Configure nginx with deploy/nginx.conf"
echo ""
