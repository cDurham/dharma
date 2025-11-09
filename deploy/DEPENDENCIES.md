# Dependency Organization

This project uses **comment sections** in `package.json` to organize dependencies by purpose, even though they're all in one file.

## How It Works

```json
{
  "dependencies": {
    "//": "=== Backend (API) Dependencies ===",
    "@nestjs/common": "^11.1.3",
    // ... more backend deps
    
    "//": "=== Frontend (Web) Dependencies ===",
    "react": "^19.2.0",
    // ... more frontend deps
    
    "//": "=== CLI Dependencies ===",
    "chalk": "5.6.2",
    "commander": "14.0.1"
    // ... more CLI deps
  }
}
```

## Dependency Sections

### Production Dependencies (`dependencies`)

| Section | Purpose | Examples |
|---------|---------|----------|
| **Backend (API)** | NestJS, GraphQL, Auth, DB | `@nestjs/*`, `drizzle-orm`, `kafkajs` |
| **Frontend (Web)** | React, UI, Routing | `react`, `@mui/material`, `react-router-dom` |
| **Shared** | Used by both API and Web | `graphql`, `graphql-scalars` |
| **CLI** | Development CLI tools | `commander`, `chalk`, `ora`, `yaml` |

### Development Dependencies (`devDependencies`)

| Section | Purpose | Examples |
|---------|---------|----------|
| **Test & Mock Data** | Testing utilities | `jest`, `@testing-library/*`, `@faker-js/faker` |
| **Code Generation** | GraphQL codegen | `@graphql-codegen/*` |
| **Build Tools & CLI** | Compilation, migrations | `drizzle-kit`, `vite`, `ts-node` |
| **Nx Workspace** | Monorepo orchestration | `@nx/*`, `nx` |
| **Linting & Formatting** | Code quality | `eslint`, `prettier`, `@typescript-eslint/*` |
| **TypeScript & Types** | Type definitions | `typescript`, `@types/*` |

## Benefits

✅ **Single `npm install`** - No nested package.json files  
✅ **Clear organization** - Know what each dependency is for  
✅ **Easy to maintain** - Add new deps to the right section  
✅ **Simple is king** - One source of truth for all dependencies  

## Adding New Dependencies

```bash
# Install a new backend dependency
npm install --save some-backend-lib

# Then move it to the right section in package.json:
"dependencies": {
  "//": "=== Backend (API) Dependencies ===",
  "@nestjs/common": "^11.1.3",
  "some-backend-lib": "^1.0.0",  // ← Add here
  // ...
}
```

## Why Comments Work

Node.js and npm allow comments in `package.json` even though it's technically JSON. The `"//"` key-value pairs are valid JSON but ignored by npm/node as dependencies.

## Alternative Approaches (Not Used)

We considered but rejected:
- ❌ Separate `package.json` per tool (extra complexity)
- ❌ Workspaces for each app (overkill for our size)
- ❌ No organization (hard to maintain)

**Current approach: Simple, clear, maintainable!** 🎉

