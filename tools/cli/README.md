# Dharma CLI 🪷

A powerful command-line interface for managing the Dharma development environment.

**🎯 Single Source of Truth**: The CLI automatically discovers services by parsing `docker-compose.yml` - no manual configuration needed!

## Preview

When you run `npm run dharma`, you'll see a beautiful lotus flower banner with gradient colors:

```
         ⚛
      _.-^^---....,_
  _--\                  --_
 <\                        /)
  \\\  .  .   .  .   .  //
   )) ' '   '  '   ' (
   (_.       _//       ._)
    |'      |_\\_   '|
    |   _/      \\  |
     \._/          \\_./
      {_            _}\\__
      (_            ___)   \\
       (_.              _)  |
         \\___...___//   //
          `"-------""`_  ./
              `'''`

           DHARMA Development CLI
                v1.0.0
```

*(In your terminal, the lotus appears in beautiful gradient colors: pink → purple → gold → cyan)*

## Installation

The CLI is built into the project. All dependencies are in the root `package.json`:

```bash
npm install              # One-time: install all dependencies
npm run cli:build        # Build the CLI (first time or after changes)
npm run dharma -- <command>
```

**No separate package.json needed!** CLI dependencies are in the root with clear comment sections.

## Architecture

The CLI uses a **dynamic service registry** that parses `docker-compose.yml` at runtime:

- **Zero Configuration**: Add/remove services in docker-compose.yml, CLI auto-discovers them
- **Smart Capabilities**: Automatically detects which services can be exec'd into, rebuilt, etc.
- **Type-Safe**: Full TypeScript support with inferred types from docker-compose
- **Metadata-Rich**: Extracts ports, dependencies, health checks, and more

## Commands

### Development Environment

```bash
# Start development environment
npm run dharma -- dev up
npm run dharma -- dev up --build  # Rebuild images first

# Stop development environment
npm run dharma -- dev down
npm run dharma -- dev down --volumes  # Remove volumes too

# Restart environment
npm run dharma -- dev restart

# Rebuild services
npm run dharma -- dev rebuild        # Rebuild all services
npm run dharma -- dev rebuild api    # Rebuild only API
npm run dharma -- dev rebuild web    # Rebuild only Web

# Complete teardown
npm run dharma -- dev nuke  # Stop, remove volumes, prune

# Full reset (nuke + rebuild + migrate + seed)
npm run dharma -- dev reset
npm run dharma -- dev reset --skip-seed  # Skip seeding
```

### Logs

```bash
# Interactive service selection
npm run dharma -- logs

# View specific services
npm run dharma -- logs api web
npm run dharma -- logs kafka
npm run dharma -- logs all

# Options
npm run dharma -- logs --tail 100     # Show last 100 lines
npm run dharma -- logs --no-follow    # Don't follow logs
```

### Database

```bash
# Push schema changes
npm run dharma -- db push

# Seed database
npm run dharma -- db seed

# Reset database (drop, push, seed)
npm run dharma -- db reset

# Open Drizzle Studio
npm run dharma -- db studio

# Open PostgreSQL shell
npm run dharma -- db shell

# Generate migration
npm run dharma -- db generate

# Run migrations
npm run dharma -- db migrate
```

### Container Management

```bash
# Execute command in container
npm run dharma -- exec api sh       # Shell into API
npm run dharma -- exec web sh       # Shell into Web
npm run dharma -- exec api npm test # Run command in API

# Interactive service selection
npm run dharma -- exec  # Prompts for service
```

### Status

```bash
# Show status of all services
npm run dharma -- status
npm run dharma -- ps  # Alias
```

## Development

Build the CLI:
```bash
npm run cli:build
```

Watch mode (auto-rebuild on changes):
```bash
npm run cli:watch
```

### Project Structure

```
tools/cli/
  ├── src/
  │   ├── index.ts              # CLI entry point
  │   ├── commands/             # All commands
  │   │   ├── dev.ts           # Development environment
  │   │   ├── logs.ts          # Log viewing
  │   │   ├── db.ts            # Database operations
  │   │   ├── exec.ts          # Container exec
  │   │   └── status.ts        # Status display
  │   ├── config/              # Configuration
  │   │   ├── docker-compose-parser.ts  # Parses docker-compose.yml
  │   │   └── services.ts      # Service registry singleton
  │   └── utils/
  │       └── docker.ts        # Docker utilities
  ├── dist/                    # Compiled output
  └── tsconfig.json           # TypeScript config

# Dependencies live in root package.json with comment sections
```

## Features

- 🎯 **Single Source of Truth** - Parses docker-compose.yml automatically
- 🎨 **Beautiful output** - Color-coded, spinner animations, clear status messages
- 🔄 **Interactive prompts** - Select services from a list when not specified
- 🧠 **Smart** - Knows which services can be exec'd, rebuilt, etc.
- 🚀 **Fast** - Efficient command execution with proper error handling
- 📝 **Helpful** - Built-in help for every command
- 🎯 **Type-safe** - Written in TypeScript
- 🔄 **Zero Config** - Add services to docker-compose.yml, CLI auto-discovers them

## Migration from package.json Scripts

Old commands → New CLI commands:

| Old | New |
|-----|-----|
| `npm run d:dev` | `npm run dharma -- dev up` |
| `npm run d:dev:reset` | `npm run dharma -- dev reset` |
| `npm run d:dev:logs` | `npm run dharma -- logs` |
| `npm run d:dev:api:logs` | `npm run dharma -- logs api` |
| `npm run d:dev:rebuild` | `npm run dharma -- dev rebuild` |
| `npm run d:dev:ps` | `npm run dharma -- status` |
| `npm run d:dev:api:exec` | `npm run dharma -- exec api` |

The `package.json` has been cleaned up - all Docker orchestration is now in the CLI!

