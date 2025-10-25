# Dharma CLI

A command-line interface for managing the Dharma development environment.

## Setup

```bash
npm install           # Install dependencies
npm run cli:build     # Build the CLI
```

## Usage

```bash
npm run dharma -- <command>
```

## Main Commands

### Development
- `dev up` - Start development environment
- `dev down` - Stop development environment
- `dev restart` - Restart environment
- `dev rebuild [service]` - Rebuild services
- `dev reset` - Full reset (nuke + rebuild + migrate + seed)

### Database
- `db push` - Push schema changes
- `db seed` - Seed database
- `db reset` - Reset database
- `db studio` - Open Drizzle Studio
- `db shell` - Open PostgreSQL shell

### Logs
- `logs [services...]` - View logs for services

### Status
- `status` - Show status of all services

### Exec
- `exec <service> <command>` - Execute command in container

## Getting Help

For detailed help on any command:

```bash
npm run dharma -- --help
npm run dharma -- <command> --help
```
