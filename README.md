# Dharma

Full-stack NX monorepo with NestJS GraphQL API backend and React frontend.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.0.0 *(includes npm automatically)*
- **Docker** & **Docker Compose** (for containerized setup)

### Installing Prerequisites

<details>
<summary><strong>macOS</strong></summary>

#### Option 1: Using Homebrew (Recommended)

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (includes npm)
brew install node@20

# Add to PATH (node@20 is keg-only and won't be linked automatically)
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify installation
node --version   # Should be >= 20.0.0
npm --version    # Should be >= 10.0.0

# Install Docker Desktop
brew install --cask docker

# Start Docker Desktop from Applications folder
# Or from command line:
open -a Docker
```

#### Option 2: Using Official Installers

1. **Node.js:**
   - Download from: https://nodejs.org/en/download/
   - Choose the LTS version (20.x or higher)
   - Run the installer

2. **Docker Desktop:**
   - Download from: https://www.docker.com/products/docker-desktop/
   - Run the installer
   - Start Docker Desktop from Applications

</details>

<details>
<summary><strong>Linux (Ubuntu/Debian)</strong></summary>

```bash
# Update package index
sudo apt update

# Install Node.js 20.x via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version   # Should be >= 20.0.0
npm --version    # Should be >= 10.0.0

# Install Docker
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify Docker installation
docker --version
docker compose version
```

</details>

<details>
<summary><strong>Linux (Fedora/RHEL/CentOS)</strong></summary>

```bash
# Install Node.js 20.x
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# Verify installation
node --version
npm --version

# Install Docker
sudo dnf -y install dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify Docker installation
docker --version
docker compose version
```

</details>

<details>
<summary><strong>Windows</strong></summary>

#### Option 1: Using Winget (Windows Package Manager)

```powershell
# Install Node.js
winget install OpenJS.NodeJS.LTS

# Install Docker Desktop
winget install Docker.DockerDesktop

# Restart your terminal and verify
node --version
npm --version
docker --version
docker compose version
```

#### Option 2: Using Chocolatey

```powershell
# Install Chocolatey first if you don't have it
# Run PowerShell as Administrator:
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js and Docker
choco install nodejs-lts
choco install docker-desktop

# Restart your terminal and verify
node --version
npm --version
docker --version
```

#### Option 3: Manual Installation

1. **Node.js:**
   - Download from: https://nodejs.org/en/download/
   - Run the `.msi` installer
   - Restart your terminal

2. **Docker Desktop:**
   - Download from: https://www.docker.com/products/docker-desktop/
   - Run the installer
   - **Important:** Enable WSL 2 if prompted (recommended for better performance)
   - Restart your computer if required

</details>

#### Verify All Prerequisites

```bash
# Check versions
node --version    # Should show v20.x.x or higher
npm --version     # Should show 10.x.x or higher
docker --version  # Should show Docker version info
docker compose version  # Should show Docker Compose version info

# Test Docker is running
docker run hello-world
```

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd dharma

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy the example environment file
cp env.example .env

### 3. Build the Dharma CLI

```bash
# Build the custom CLI tool (one-time setup)
npm run cli:build

# Make it globally accessible (optional but recommended)
npm link
```

### 4. Run with Docker (Recommended)

```bash
# Start all services in development mode
dharma dev up

# This starts:
# - PostgreSQL (port 5432)
# - Kafka + Zookeeper (port 9092)
# - API server (port 3000)
# - Web frontend (port 4200)
```

**Access the application:**
- Frontend: http://localhost:4200
- API GraphQL Playground: http://localhost:3000/graphql

### 5. Initialize Database

```bash
# Reset database schema and seed data
dharma db reset

# Or run individually:
dharma db push    # Push schema
dharma db seed    # Seed data
```

---

## 🛠️ Development

### Dharma CLI Commands (Recommended)

The project includes a custom CLI tool for streamlined development:

```bash
# Development Environment
dharma dev up           # Start development environment
dharma dev down         # Stop development environment
dharma dev restart      # Restart development environment
dharma dev rebuild api  # Rebuild API service
dharma dev rebuild web  # Rebuild web service
dharma dev rebuild all  # Rebuild everything
dharma dev reset        # Full teardown and fresh rebuild
dharma dev nuke         # Complete cleanup (removes volumes)

# Service Status & Logs
dharma status           # Show status of all services (alias: dharma ps)
dharma logs api         # View API logs
dharma logs web         # View web logs
dharma logs api web     # View multiple service logs

# Execute Commands in Containers
dharma exec api sh      # Open shell in API container
dharma exec web sh      # Open shell in web container

# Database Operations
dharma db push          # Push database schema
dharma db seed          # Seed database
dharma db reset         # Reset database (push + seed)
```

**Service Aliases:** You can use short names (`api`, `web`) or full names (`api-dev`, `web-dev`) - they're equivalent in dev mode.

### Alternative: Local Development (without Docker)

If you prefer running services locally outside Docker:

#### 1. Start Infrastructure Services

```bash
# Start only PostgreSQL and Kafka (using Docker for infrastructure)
docker compose up db kafka zookeeper -d
```

#### 2. Run API

```bash
# Terminal 1: Run API server locally
npm run api:serve

# The API will be available at http://localhost:3000
# GraphQL Playground: http://localhost:3000/graphql
```

#### 3. Run Web Frontend

```bash
# Terminal 2: Run web dev server locally
npm run web:serve

# The frontend will be available at http://localhost:4200
```

### Code Generation

```bash
# Generate TypeScript types from GraphQL schema (both apps)
npm run codegen

# Generate for specific app
npm run web:codegen    # Frontend GraphQL client types
npm run api:codegen    # API (currently not configured)
```

---

## 🧪 Testing

```bash
# Run all tests
nx run-many --target=test

# Test specific app
npm run api:test
npm run web:test

# Run tests in watch mode
nx test api --watch
nx test web --watch
```

---

## 🗄️ Database Management

```bash
# Using Dharma CLI (Recommended)
dharma db reset    # Reset database (push schema + seed)
dharma db push     # Push schema changes
dharma db seed     # Seed data only

# Alternative: Using npm scripts (if not using Docker)
npm run api:db:reset
npm run api:db:sync
npm run api:db:seed
```

**Connect to PostgreSQL:**
```bash
# Via Dharma CLI
dharma exec db psql -U postgres -d dharma_db

# Or via Docker directly
docker compose exec db psql -U postgres -d dharma_db

# Or locally (if psql is installed)
psql -h localhost -p 5432 -U postgres -d dharma_db
```

---

## 🏗️ Project Structure

```
dharma/
├── apps/
│   ├── api/                    # NestJS GraphQL API
│   │   ├── src/
│   │   │   ├── Auth/           # Authentication module
│   │   │   ├── User/           # User management (CQRS)
│   │   │   ├── Member/         # Member module (CQRS)
│   │   │   ├── Retreat/        # Retreat module (CQRS)
│   │   │   ├── Email/          # Email service
│   │   │   ├── kafka/          # Kafka integration
│   │   │   ├── db/             # Database config & seeds
│   │   │   └── ...
│   │   └── project.json        # NX project config
│   │
│   └── web/                    # React + Vite frontend
│       ├── src/
│       │   ├── component/      # React components
│       │   ├── graphql/        # GraphQL queries & generated types
│       │   └── ...
│       └── project.json        # NX project config
│
├── docker-compose.yml          # Docker orchestration
├── Dockerfile                  # Multi-stage build
├── nx.json                     # NX workspace config
└── package.json                # Dependencies & scripts
```

---

## 📦 Available Scripts

### Workspace Commands

```bash
npm run clean              # Clean dist folder
npm run codegen            # Run code generation for all apps
```

### API Commands

```bash
npm run api:serve          # Start API dev server
npm run api:build          # Build API for production
npm run api:lint           # Lint API code
npm run api:test           # Run API tests
npm run api:db:reset       # Reset & seed database
npm run api:db:sync        # Sync database schema
npm run api:db:seed        # Seed database
```

### Web Commands

```bash
npm run web:serve          # Start web dev server
npm run web:build          # Build web for production
npm run web:lint           # Lint web code
npm run web:test           # Run web tests
npm run web:codegen        # Generate GraphQL types
```

### Docker/CLI Commands

```bash
# Using Dharma CLI (Recommended)
dharma dev up              # Start dev environment
dharma dev down            # Stop dev environment
dharma dev restart         # Restart dev environment
dharma dev rebuild all     # Rebuild dev environment
dharma dev rebuild api     # Rebuild only API service
dharma status              # Show service status
dharma logs api web        # View logs

# Using npm scripts (alternative)
npm run d:dev              # Start dev profile
npm run d:prod             # Start prod profile
npm run d:dev:restart      # Restart dev environment
npm run d:dev:rebuild      # Rebuild dev environment
npm run d:dev:rebuild:api  # Rebuild only API service
```

---

## 🚢 Production Deployment

### Build & Run with Docker

```bash
# Start production profile
npm run d:prod

# This builds and runs:
# - API server (port 3000)
# - Web frontend with Nginx (port 8080)
# - PostgreSQL
# - Kafka
```

**Access production build:**
- Frontend: http://localhost:8080
- API: http://localhost:3000/graphql

### Build Locally

```bash
# Build both apps
nx run-many --target=build

# Build specific app
npm run api:build    # Output: dist/apps/api
npm run web:build    # Output: dist/apps/web
```

---

## 🔍 NX Features

### Dependency Graph

```bash
# Visualize project dependencies
npx nx graph
```

### Affected Commands

```bash
# Only build/test what changed
nx affected --target=build
nx affected --target=test
```

### Run Multiple Targets

```bash
# Run target across all projects
nx run-many --target=lint
nx run-many --target=test
nx run-many --target=build --parallel=3
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using a port
lsof -i :3000    # API port
lsof -i :4200    # Web port
lsof -i :5432    # PostgreSQL port

# Stop Docker containers
dharma dev down
```

### Database Connection Issues

```bash
# Verify database is running
dharma status

# Check database logs
dharma logs db

# Reset database
dharma db reset
```

### Kafka Connection Issues

```bash
# Check Kafka health
dharma status

# View Kafka logs
dharma logs kafka

# Restart entire environment
dharma dev restart
```

### Node Modules Issues

```bash
# Clean install locally
rm -rf node_modules
npm install

# Rebuild Docker containers
dharma dev rebuild all
```

### Hot Reload Not Working

Docker volumes are configured for hot-reload in dev mode. If changes aren't reflecting:

```bash
# Restart development services
dharma dev restart

# Or rebuild specific service
dharma dev rebuild api  # or web

# Or full rebuild
dharma dev rebuild all
```

### Complete Environment Reset

If everything is broken and you want to start fresh:

```bash
# Nuclear option: complete teardown and rebuild
dharma dev nuke   # Stop everything and remove volumes
dharma dev up     # Start fresh

# Or use reset (stops, rebuilds, starts)
dharma dev reset
```

---

## 📚 Key Technologies

- **NX** - Monorepo build system
- **NestJS** - Backend framework
- **GraphQL** - API query language
- **Drizzle ORM** - Database ORM
- **CQRS** - Command Query Responsibility Segregation pattern
- **React** - Frontend library
- **Vite** - Frontend build tool
- **Apollo Client** - GraphQL client
- **PostgreSQL** - Database
- **Kafka** - Event streaming
- **Docker** - Containerization

---

## 📝 License

[Your License Here]

## 🤝 Contributing

[Your Contributing Guidelines Here]

