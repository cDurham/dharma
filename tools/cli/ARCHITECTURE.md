# CLI Architecture

## Overview

The Dharma CLI uses a **dynamic service registry** that parses `docker-compose.yml` as the single source of truth. This ensures zero configuration drift between Docker Compose and the CLI.

## Components

### 1. Docker Compose Parser (`config/docker-compose-parser.ts`)

Parses `docker-compose.yml` and extracts:
- Service names and container names
- Profiles (dev, prod, all)
- Build configurations (determines rebuildability)
- Port mappings
- Dependencies (depends_on)
- Health checks
- Volumes and environment

**Key Functions:**
- `parseDockerCompose()` - Main parser
- `detectProfile()` - Determines service profile
- `canExecuteShell()` - Checks if service is execable
- `hasRebuildCapability()` - Checks if service can be rebuilt

### 2. Service Registry (`config/services.ts`)

Singleton that loads and manages parsed services:

```typescript
const services = serviceRegistry.getAllServices();
const apiService = serviceRegistry.getService('api');
const execableServices = serviceRegistry.getExecableServices();
const rebuildableServices = serviceRegistry.getRebuildableServices();
```

**Capabilities Detected:**
- `canExec` - Can we shell into this container?
- `canRebuild` - Does it have a build config?
- `canRestart` - All containers can restart
- `hasLogs` - All containers have logs

### 3. Commands

All commands use the service registry:

```typescript
import { serviceRegistry } from '../config/services.js';

const services = serviceRegistry.getAllServices();
const containerName = serviceRegistry.getContainerName('api');
```

## Service Discovery Logic

### Profile Detection
```
No profiles → 'all' (runs in all environments)
profiles: ['dev'] → 'dev'
profiles: ['prod'] → 'prod'
```

### Container Naming
```
Format: {project}-{service}-{replica}
Example: dharma-api-dev-1
```

### Exec Capability
A service is execable if:
1. It has a `build` configuration (our code), OR
2. It's in the known list (api, web, db), OR
3. Its name contains 'db' or 'postgres'

### Rebuild Capability
A service is rebuildable if:
1. It has a `build` configuration in docker-compose.yml

## Adding New Services

Simply add to `docker-compose.yml`:

```yaml
services:
  my-new-service:
    build:
      context: .
      target: my_service
    profiles: ["dev"]
    ports: ["5000:5000"]
```

The CLI will automatically:
- ✅ Discover it in `dharma status`
- ✅ Allow `dharma logs my-new-service`
- ✅ Allow `dharma exec my-new-service` (if it has a build)
- ✅ Allow `dharma dev rebuild my-new-service` (if it has a build)

## Benefits

### 1. Zero Configuration Drift
Docker Compose is the source of truth. CLI always reflects current state.

### 2. Easy Maintenance
Add/remove services in one place (docker-compose.yml).

### 3. Smart Behavior
CLI knows what operations are valid for each service.

### 4. Extensible
Easy to add more metadata extraction (volumes, networks, etc.).

## Future Enhancements

Potential additions:
- Parse health check status from containers
- Extract environment variables
- Show network topology
- Validate dependencies before operations
- Support for multiple compose files
- Cache parsed data for faster startup

