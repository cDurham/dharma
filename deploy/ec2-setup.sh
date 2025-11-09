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

# Setup GitHub Container Registry authentication
echo ""
echo "🐙 Setting up GitHub Container Registry (GHCR) authentication..."
echo ""
echo "To pull Docker images from GHCR, you need a GitHub Personal Access Token (PAT)."
echo ""
echo "Create one at: https://github.com/settings/tokens/new"
echo "Required scope: read:packages"
echo ""
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -sp "Enter your GitHub PAT (input hidden): " GITHUB_PAT
echo ""

if [ -n "$GITHUB_USERNAME" ] && [ -n "$GITHUB_PAT" ]; then
    echo "🔐 Logging into GHCR..."
    sudo -u deploy bash << EOF
docker login ghcr.io -u "$GITHUB_USERNAME" -p "$GITHUB_PAT"
EOF
    if [ $? -eq 0 ]; then
        echo "✅ GHCR authentication successful!"
    else
        echo "⚠️  GHCR authentication failed. You can run this manually later:"
        echo "   docker login ghcr.io -u YOUR_USERNAME -p YOUR_PAT"
    fi
else
    echo "⚠️  Skipping GHCR authentication (no credentials provided)"
    echo "   You'll need to run this manually before deploying:"
    echo "   docker login ghcr.io -u YOUR_USERNAME -p YOUR_PAT"
fi

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
echo "📋 Next steps: See deploy/DEPLOYMENT.md (Step 3.3 onwards)"
echo "💡 EC2_HOST for GitHub Secrets: $EC2_IP"
echo ""
