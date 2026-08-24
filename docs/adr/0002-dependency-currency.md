# ADR 0002 — Dependency currency: automated upgrades behind a real CI gate

- **Status:** Accepted
- **Date:** 2026-08-23
- **Deciders:** c.durham

## Context

dharma is a new project and wants to run close to the head of its dependency
tree. At the time of writing it is not close: **72 packages are behind, 28 of
them by at least one major**, and `pnpm audit` reports **232 advisories (6
critical, 123 high)**, almost all transitive through `@nestjs-modules/mailer`
(which pulls the whole `mjml` tree) and `@nx/react` (which pulls `express@4`).

The obstacle was never appetite. It was that the repo had no mechanism to hold a
dependency *floor*, let alone chase a ceiling. Four facts, all verified:

- **Four lockfiles were committed**: `package-lock.json` (last touched
  2025-11-09, nine months stale), `tools/cli/package-lock.json`,
  `tools/cli/pnpm-lock.yaml`, and the live root `pnpm-lock.yaml`. The project is
  pnpm everywhere that matters — `packageManager`, CI, Dockerfile — so the other
  three resolved a graph nothing actually used, and any `npm install` would have
  silently produced a different tree than CI and production.
- **`pnpm run typecheck` had never worked.** It ran `tsc -b --noEmit` against a
  root `tsconfig.json` that does not exist; only `tsconfig.base.json` does. It
  failed with `TS5083` on every invocation, which is why it was never in CI.
- **The lint target mutates.** `api:lint` / `web:lint` run `biome check --write`.
  On a runner that rewrites files and exits zero, so formatting and lint
  regressions could never fail a PR. `biome ci .` currently reports 29 errors
  that the mutating gate has been absorbing.
- **CI never built and never typechecked.** It linted (see above) and ran unit
  tests. An upgrade that does not compile would have gone green.

Automating upgrades on top of that is how a new project acquires an
unattributable breakage it cannot bisect. The gate has to come first.

## Decision

**1. One package manager, one lockfile.** pnpm, root only. The three orphans are
deleted, `.gitignore` refuses their return, and `dharma deps` fails CI if any
reappear.

**2. CI is a real gate before any automerge exists.** `test.yml` now runs
`biome ci` (non-mutating), `typecheck` (repointed at the actual project
references: `tsc -b apps/api apps/web tools/cli`, verified passing under
`--force`), the existing tests, a full `build` of all three projects, and the
dependency-policy check. Typecheck and build are the two that make an automerged
bump safe; lint and unit tests alone do not catch a broken compile.

**3. Renovate, not Dependabot.** `renovate.json` groups packages that ship in
lockstep (NestJS, Nx, graphql-codegen, vite+vitest, React, drizzle, swc,
testing-library) because a partial bump of any of those is a broken build rather
than a partial upgrade. Automerge is granted to patch/minor devDependencies,
patch runtime dependencies, and `@types/*`; majors, runtime minors, TypeScript
majors and Biome always get a human. `minimumReleaseAge` of 2–3 days buys an
unpublish window.

**4. A pnpm catalog for anything shared.** `chalk`, `commander`, `ora`,
`prompts`, `yaml`, `typescript`, `@types/node` and `@types/prompts` are declared
in more than one workspace package. They now resolve through `catalog:` in
`pnpm-workspace.yaml`, so two packages cannot land on different majors of the
same library and an upgrade is a single edit.

**5. `dharma deps` owns the invariants no bot checks.** Renovate answers "is this
behind?". It does not answer "is this repo internally consistent about what it
already has". The command checks: single lockfile; Node major agreement across
`.nvmrc`, `engines` and every Dockerfile `FROM`; `biome.json`'s pinned `$schema`
URL matching the installed binary; and catalog coverage — including the case
where a catalog entry exists but a member has opted back out to a hard-coded
range, which is the variant that makes the repo *look* covered.

**6. CI is a dependency surface too.** Every action in the workflows was behind:
`actions/checkout@v4` (v7 available), `actions/setup-node@v4` (v7),
`pnpm/action-setup@v4` (v6), `docker/build-push-action@v5` (v7),
`docker/login-action@v3` (v4), `docker/setup-buildx-action@v3` (v4). Nothing
fails when an action is three majors old, so the drift is invisible. Renovate's
`github-actions` and `dockerfile` managers are enabled explicitly (rather than
inherited from the preset), actions are grouped and automerged — the suite is
the test for an action bump — and `appleboy/ssh-action`, pinned to a commit SHA
on the deploy job, is excluded from automerge as supply-chain surface.

The pnpm version was also stated three times: `packageManager`, and a `version:`
input in each workflow. The workflow inputs are removed; `pnpm/action-setup`
reads `packageManager`, so CI cannot run a different resolver than Docker.

## Consequences

- **Renovate needs enabling on the repository before any of `renovate.json` takes
  effect. Until then it is inert configuration and nothing upgrades itself.**
  `dharma deps` reports drift without it; it does not close it.
- The 29 `biome ci` errors must be cleared (`pnpm run lint` fixes them, since
  that is what the mutating target already does) or the new Lint step fails every
  PR. This is a one-time debt payment for a gate that has never been real.
- The 28 major upgrades are **not** taken here. Each is a decision with its own
  blast radius — `typescript` 5.9 → 7.0 is the native compiler port,
  `@mui/material` 6 → 9 is three majors of breaking API, `vitest` 2 → 4 and
  `graphql` 16 → 17 both change test and schema behaviour. Renovate will raise
  them as individual PRs against a CI that can now actually judge them.
- The advisory count will not fall much until `@nestjs-modules/mailer` is
  replaced or its `mjml` dependency is dropped; it accounts for the majority of
  the high-severity paths. Tracked separately.

## Verification

```sh
pnpm run typecheck          # tsc -b across api, web, cli
pnpm run ci:check           # non-mutating biome
pnpm run dharma deps        # drift, advisories, invariants
pnpm run dharma deps --ci   # exits 1 on any error-severity violation
```
