# dharma

NestJS + GraphQL (code-first, Apollo) + Drizzle/Postgres API, React 19 web client,
and a `dharma` dev CLI. pnpm workspace driven by Nx. Deployed to EC2 via GHCR images.

## Dependency currency

**Run `pnpm run deps` to see how far behind the tree is, what advisories are open,
and whether the repo still satisfies its own version-policy invariants.**

```sh
pnpm run deps          # drift + advisories + invariants (hits the registry, ~30s)
pnpm run deps:majors   # same, listing every package behind a major
pnpm run deps:ci       # invariants only — no network, <1s, exits 1 on violations
```

All three build the CLI first, so they work on a fresh clone.

The invariants are the part no dependency bot checks — they answer "is this repo
internally consistent about the versions it already has", not "is this behind":

| Check | Catches |
|---|---|
| `single-lockfile` | a stray `package-lock.json` or a nested `pnpm-lock.yaml` resolving a different graph than CI |
| `node-major-agreement` | `.nvmrc`, `engines.node` and the Dockerfile `FROM node:<major>` drifting apart |
| `biome-schema-pin` | `biome.json`'s `$schema` URL not matching the installed `@biomejs/biome` |
| `catalog-coverage` | a dep shared by two packages with a hard-coded range — including one that opted *back out* of an existing catalog entry |
| `action-pinning` / `action-sha-pins` | workflow actions on a floating ref, or SHA-pinned and therefore only movable by Renovate |
| `pnpm-single-source` | the pnpm version restated in a workflow instead of read from `packageManager` |

Only `error` severity fails CI; warnings print and pass.

**Renovate opens the actual upgrade PRs** (`renovate.json`) — grouped by release
train, automerging patch/minor devDeps and `@types/*`, humans on majors. It is
**inert until enabled on the repository**; `pnpm run deps` reports drift without
it but closes none of it.

Rationale and the state of things when this was set up: `docs/adr/0002-dependency-currency.md`.

## Version policy

- **pnpm only.** One lockfile, at the root. The version lives in `packageManager`
  and nowhere else — workflows read it via `pnpm/action-setup` with no `version:`.
- **Anything used by more than one workspace package goes in the `catalog:`**
  block of `pnpm-workspace.yaml` and is referenced as `"catalog:"`.
- **Node major is stated in three files** (`.nvmrc`, `engines`, `Dockerfile`) and
  they must agree. `.nvmrc` is what CI reads.

## CI gates

`.github/workflows/test.yml` on every PR to `trunk`: lint → typecheck → test →
build → dependency policy.

- **Lint is `pnpm run ci:check` (`biome ci`), not `pnpm run lint`.** The `lint`
  target runs `biome check --write`, which mutates files and always exits 0 — it
  is a local fixer, never a gate. Use `pnpm run lint` to fix, `ci:check` to verify.
- **`pnpm run typecheck` is `tsc -b apps/api apps/web tools/cli`.** There is no
  root `tsconfig.json`, only `tsconfig.base.json`; each project carries a
  solution-style `tsconfig.json` with references.
- Typecheck and build are what make an automerged dependency bump safe. Lint and
  unit tests alone will green-light an upgrade that does not compile.

`.github/workflows/deps.yml` runs the drift report weekly and on demand.

## Known debt

- **232 advisories (6 critical, 123 high)**, overwhelmingly transitive through
  `@nestjs-modules/mailer` (pulls the whole `mjml` tree) and `@nx/react`
  (pulls `express@4`). No amount of version-chasing fixes these; the dependency
  has to be replaced.
- **28 packages behind a major**, deliberately not taken in one sweep —
  `typescript` 5.9 → 7.0 is the native compiler port, `@mui/material` 6 → 9 is
  three majors of API change, `vitest` 2 → 4 and `graphql` 16 → 17 change test
  and schema behaviour. Each gets its own PR.
