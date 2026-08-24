/**
 * Dependency policy invariants.
 *
 * Renovate answers "is this package behind?". It cannot answer "is this repo
 * internally consistent about the versions it already has" — that is what lives
 * here. Every check below was written because the repo had actually violated it.
 */

export type Severity = "error" | "warn";

export type Violation = {
  check: string;
  severity: Severity;
  detail: string;
  fix: string;
};

/**
 * Exactly one lockfile, at the workspace root. A stray `package-lock.json`
 * resolves a different graph than CI and the Dockerfile, and a nested
 * `pnpm-lock.yaml` freezes a workspace member out of root-level upgrades.
 */
export const ALLOWED_LOCKFILES = ["pnpm-lock.yaml"] as const;

export const FORBIDDEN_LOCKFILE_GLOBS = [
  "package-lock.json",
  "yarn.lock",
  "bun.lockb",
  "apps/*/package-lock.json",
  "apps/*/pnpm-lock.yaml",
  "apps/*/yarn.lock",
  "tools/*/package-lock.json",
  "tools/*/pnpm-lock.yaml",
  "tools/*/yarn.lock",
  "packages/*/package-lock.json",
  "packages/*/pnpm-lock.yaml",
  "packages/*/yarn.lock",
] as const;

/**
 * Files that each independently name the Node major. They drift apart silently:
 * nothing fails when the Dockerfile builds on 22 and CI tests on 24.
 */
export const NODE_VERSION_SOURCES = [
  { file: ".nvmrc", pattern: /^\s*v?(\d+)/m },
  { file: "package.json", pattern: /"node"\s*:\s*">=\s*(\d+)/ },
  { file: "Dockerfile", pattern: /FROM\s+node:(\d+)/ },
] as const;

/**
 * biome.json pins its `$schema` to an exact version URL. When the binary is
 * bumped and the schema URL is not, editors validate against the old rule set
 * and silently accept config that the new binary rejects — or worse, ignores.
 */
export const BIOME_SCHEMA_PATTERN =
  /biomejs\.dev\/schemas\/(\d+\.\d+\.\d+)\/schema\.json/;
