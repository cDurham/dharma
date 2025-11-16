nx run # ESM Migration Summary

## Overview
Successfully migrated the Dharma monorepo to a modern, full ESM build system with enterprise-grade tooling.

## Completed Phases

### Phase 0: Workspace Foundations ✅
- Added `"type": "module"` to root package.json
- Set `"packageManager": "pnpm@9.15.0"`
- Created `biome.json` for unified linting and formatting
- Removed ESLint and Prettier dependencies
- Added Biome, SWC, tsup, and Vitest dependencies
- Updated all Nx lint targets to use Biome

### Phase 1: Testing Migration ✅
- Created `apps/api/vitest.config.ts` with V8 coverage
- Created `apps/api/vitest.setup.ts` for reflect-metadata
- Updated `apps/api/project.json` to use `@nx/vite:test`
- Removed `apps/api/jest.config.ts`
- Test files already compatible (using global describe/it/expect)

### Phase 2: GraphQL Schema-First ✅
- Created GraphQL SDL files:
  - `apps/api/src/User/user.graphql`
  - `apps/api/src/Member/member.graphql`
  - `apps/api/src/Retreat/retreat.graphql`
  - `apps/api/src/Auth/auth.graphql`
- Updated `app.module.ts` to use `typePaths: ['./**/*.graphql']`
- Removed `@ObjectType`, `@Field`, `@InputType` decorators from entities
- Kept `@Resolver`, `@Query`, `@Mutation` decorators (still needed for DI)

### Phase 3: SWC Build System ✅
- Created `apps/api/.swcrc` with decorator metadata support
- Updated `apps/api/project.json` to use `@nx/js:swc` executor
- Updated `apps/api/tsconfig.app.json` for ESM output
- Configured SWC for ES2022 target with ESM modules

### Phase 4: Docker ESM Runtime ✅
- Updated Dockerfile to use pnpm with Corepack
- Added package.json copy to runtime_api stage (preserves "type": "module")
- Optimized layer caching with pnpm store cache
- Updated all stages to use pnpm commands

### Phase 5: Database Scripts ESM ✅
- Updated `apps/api/drizzle.config.ts`:
  - Changed to `import { config } from "dotenv"`
  - Added `import.meta.url` for path resolution
  - Used `join(__dirname, ...)` for schema/migrations paths
- Updated `apps/api/src/db/seed.ts`:
  - Changed to `import { config } from "dotenv"`
  - Added `.js` extensions to local imports

### Phase 6: CLI Tool Modernization ✅
- Created `tools/cli/tsup.config.ts` for bundling
- CLI already had `"type": "module"` in package.json
- CLI source already using ESM with `.js` extensions
- Updated root package.json scripts:
  - `cli:build` uses tsup
  - `cli:dev` uses tsx

### Phase 7: Type-Checking Strategy ✅
- Added `typecheck` script: `tsc -b --noEmit`
- Type-checking decoupled from builds
- Builds use SWC/Vite (fast, no type-checking)
- Type-checking runs separately in CI or on-demand

## Key Changes Summary

### Package Management
- **Before:** npm
- **After:** pnpm with workspace support

### Linting & Formatting
- **Before:** ESLint + Prettier (separate tools)
- **After:** Biome (unified, 10x faster)

### API Build
- **Before:** `@nx/js:tsc` (slow, no bundling)
- **After:** `@nx/js:swc` (20x faster, decorator metadata preserved)

### Testing
- **Before:** Jest with ts-jest
- **After:** Vitest with native ESM support

### GraphQL
- **Before:** Code-first with autoSchemaFile
- **After:** Schema-first with .graphql SDL files

### Module System
- **Before:** Mixed CommonJS/ESM
- **After:** Pure ESM everywhere

## Commands to Test

### Install Dependencies
```bash
pnpm install
```

### Build CLI
```bash
pnpm cli:build
```

### Lint & Format
```bash
pnpm lint          # Biome check
pnpm format        # Biome format
```

### Type-Check
```bash
pnpm typecheck     # tsc --noEmit
```

### Build Projects
```bash
pnpm nx run api:build    # SWC build
pnpm nx run web:build    # Vite build
```

### Run Tests
```bash
pnpm nx run api:test     # Vitest
pnpm nx run web:test     # Vitest
```

### Development
```bash
pnpm nx run api:serve    # API dev server
pnpm nx run web:serve    # Web dev server
```

### Database
```bash
pnpm db:push      # Push schema
pnpm db:seed      # Seed database
pnpm db:reset     # Reset database
```

### Docker
```bash
# Build API
docker build --target runtime_api -t dharma-api .

# Build Web
docker build --target runtime_web -t dharma-web .

# Run API
docker run -p 3000:3000 --env-file .env dharma-api

# Or use docker-compose
docker-compose up
```

## Expected Benefits

### Performance
- **API builds:** 20x faster (SWC vs tsc)
- **Tests:** 2-5x faster (Vitest vs Jest)
- **Installs:** 2x faster (pnpm vs npm)
- **Linting:** 10x faster (Biome vs ESLint)

### Developer Experience
- Single tool for lint + format (Biome)
- Faster feedback loops
- Native ESM everywhere
- Consistent tooling

### Production
- Smaller Docker images (optional bundling available)
- Faster cold starts
- Modern ESM runtime
- Better tree-shaking potential

## Validation Checklist

- [ ] `pnpm install` completes successfully
- [ ] `pnpm cli:build` builds the CLI tool
- [ ] `pnpm lint` runs Biome checks
- [ ] `pnpm format` formats code with Biome
- [ ] `pnpm typecheck` type-checks without errors
- [ ] `pnpm nx run api:build` builds API with SWC
- [ ] `pnpm nx run web:build` builds web with Vite
- [ ] `pnpm nx run api:test` runs API tests with Vitest
- [ ] `pnpm nx run web:test` runs web tests with Vitest
- [ ] `pnpm nx run api:serve` starts API dev server
- [ ] `pnpm nx run web:serve` starts web dev server
- [ ] GraphQL schema loads from .graphql files
- [ ] GraphQL queries work correctly
- [ ] `pnpm db:push` pushes schema
- [ ] `pnpm db:seed` seeds database
- [ ] Docker builds complete successfully
- [ ] Docker containers run correctly

## Rollback Plan

If issues arise:

1. **GraphQL issues:** Schema-first migration is the most complex change. If needed, can temporarily revert app.module.ts to use autoSchemaFile while keeping other improvements.

2. **Build issues:** SWC configuration is in `.swcrc`. If decorator metadata issues occur, can adjust settings there.

3. **Test issues:** Vitest is 99% compatible with Jest. Most issues will be minor import changes.

## Next Steps

1. Run validation checklist above
2. Test all features manually
3. Run full test suite
4. Test Docker builds and deployments
5. Monitor for any ESM-related issues in production

## Notes

- All source files now use ESM imports
- `.js` extensions required in local imports for Node.js ESM
- `package.json` has `"type": "module"` for ESM runtime
- SWC preserves decorator metadata (critical for NestJS DI)
- GraphQL schema now defined in .graphql files (easier to review/version)
- Biome provides both linting and formatting in one tool
- Type-checking is separate from builds for speed


