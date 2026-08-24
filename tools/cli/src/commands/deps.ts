import { execSync } from "node:child_process";
import { existsSync, globSync, readFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import {
  BIOME_SCHEMA_PATTERN,
  FORBIDDEN_LOCKFILE_GLOBS,
  NODE_VERSION_SOURCES,
  type Violation,
} from "../config/dependency-policy.js";

type OutdatedEntry = {
  current?: string;
  latest?: string;
  dependencyType?: string;
};

type Drift = {
  name: string;
  current: string;
  latest: string;
  kind: "major" | "minor" | "patch";
};

const root = process.cwd();

function read(file: string): string | null {
  const path = join(root, file);
  return existsSync(path) ? readFileSync(path, "utf-8") : null;
}

function readJson<T>(file: string): T | null {
  const raw = read(file);
  return raw ? (JSON.parse(raw) as T) : null;
}

/**
 * pnpm exits non-zero when it finds drift or advisories, so a throw is the
 * expected path and the payload lives on `error.stdout`.
 *
 * `maxBuffer` is explicit and large: `pnpm audit --json` on this workspace emits
 * ~5 MB, and execSync's 1 MB default made the call throw with a truncated
 * stdout. That parsed to null and rendered as "0 critical" — a security gate
 * that silently reports all-clear is worse than no gate at all.
 */
function pnpmJson<T>(args: string): T | null {
  const parse = (raw?: string): T | null => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  };
  try {
    return parse(
      execSync(`pnpm ${args}`, {
        cwd: root,
        encoding: "utf-8",
        stdio: "pipe",
        maxBuffer: 64 * 1024 * 1024,
      }),
    );
  } catch (error) {
    return parse((error as { stdout?: string }).stdout);
  }
}

function classify(current: string, latest: string): Drift["kind"] {
  const c = current.replace(/^\D+/, "").split(".").map(Number);
  const l = latest.replace(/^\D+/, "").split(".").map(Number);
  if (l[0] !== c[0]) return "major";
  if (l[1] !== c[1]) return "minor";
  return "patch";
}

// ---------------------------------------------------------------------------
// Invariant checks — the part no dependency bot performs for us.
// ---------------------------------------------------------------------------

function checkLockfiles(): Violation[] {
  const found = FORBIDDEN_LOCKFILE_GLOBS.flatMap((pattern) => {
    try {
      return globSync(pattern, { cwd: root });
    } catch {
      return [];
    }
  });
  if (found.length === 0) return [];
  return [
    {
      check: "single-lockfile",
      severity: "error",
      detail: `${found.length} lockfile(s) outside the workspace root: ${found.join(", ")}`,
      fix: `git rm ${found.join(" ")}`,
    },
  ];
}

function checkNodeVersions(): Violation[] {
  const seen = new Map<string, string[]>();
  for (const source of NODE_VERSION_SOURCES) {
    const content = read(source.file);
    if (!content) continue;
    const match = content.match(source.pattern);
    if (!match) continue;
    const majors = seen.get(match[1]) ?? [];
    majors.push(source.file);
    seen.set(match[1], majors);
  }
  if (seen.size <= 1) return [];
  const summary = [...seen.entries()]
    .map(([major, files]) => `node ${major} (${files.join(", ")})`)
    .join(" vs ");
  return [
    {
      check: "node-major-agreement",
      severity: "error",
      detail: `Node major disagrees across the toolchain: ${summary}`,
      fix: "Pick one major; update .nvmrc, package.json engines and every Dockerfile FROM together.",
    },
  ];
}

function checkBiomeSchema(): Violation[] {
  const biome = read("biome.json");
  if (!biome) return [];
  const declared = biome.match(BIOME_SCHEMA_PATTERN)?.[1];
  if (!declared) return [];
  let installed: string | undefined;
  try {
    installed = JSON.parse(
      readFileSync(
        join(root, "node_modules/@biomejs/biome/package.json"),
        "utf-8",
      ),
    ).version;
  } catch {
    return [];
  }
  if (!installed || declared === installed) return [];
  return [
    {
      check: "biome-schema-pin",
      severity: "warn",
      detail: `biome.json $schema pins ${declared} but @biomejs/biome ${installed} is installed`,
      fix: `Set biome.json $schema to https://biomejs.dev/schemas/${installed}/schema.json`,
    },
  ];
}

/**
 * A dependency named by two workspace packages must go through the catalog,
 * or the two copies drift onto different majors without anything complaining.
 */
function checkCatalogCoverage(): Violation[] {
  const workspace = read("pnpm-workspace.yaml") ?? "";
  const catalogBlock = workspace.split(/^catalog:\s*$/m)[1] ?? "";
  const catalogNames = new Set(
    [...catalogBlock.matchAll(/^\s{2}"?([@\w./-]+)"?\s*:\s*["']/gm)].map(
      (m) => m[1],
    ),
  );

  const manifests = [
    "package.json",
    ...globSync("{apps,tools,packages}/*/package.json", { cwd: root }),
  ];

  // owners = every workspace package that declares the dep at all.
  // literal = those declaring a hard-coded range instead of `catalog:`.
  const owners = new Map<string, Set<string>>();
  const literal = new Map<string, Map<string, string>>();

  for (const manifest of manifests) {
    const pkg = readJson<{
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    }>(manifest);
    if (!pkg) continue;
    for (const [name, range] of Object.entries({
      ...pkg.dependencies,
      ...pkg.devDependencies,
    })) {
      if (range.startsWith("workspace:")) continue;
      owners.set(name, (owners.get(name) ?? new Set()).add(manifest));
      if (!range.startsWith("catalog:")) {
        const byManifest = literal.get(name) ?? new Map<string, string>();
        byManifest.set(manifest, range);
        literal.set(name, byManifest);
      }
    }
  }

  const violations: Violation[] = [];

  // A dep used by more than one package with any hard-coded range can drift.
  // This covers both "never catalogued" and "catalogued, but one member opted
  // back out" — the second is the sneakier of the two, because the catalog
  // entry makes the repo look covered.
  const drifters = [...owners.entries()]
    .filter(([name, pkgs]) => pkgs.size > 1 && literal.has(name))
    .map(([name]) => {
      const where = [...(literal.get(name) as Map<string, string>).entries()]
        .map(([manifest, range]) => `${manifest}: "${range}"`)
        .join(", ");
      const known = catalogNames.has(name) ? " [catalog entry exists]" : "";
      return `${name}${known} — ${where}`;
    });

  if (drifters.length > 0) {
    violations.push({
      check: "catalog-coverage",
      severity: "warn",
      detail: `${drifters.length} dep(s) shared across workspace packages carry a hard-coded range: ${drifters.join("; ")}`,
      fix: 'Add the version to the `catalog:` block in pnpm-workspace.yaml and set every member to "catalog:".',
    });
  }

  // A catalog entry nothing references is dead weight that Renovate still bumps.
  const unused = [...catalogNames].filter((name) => !owners.has(name));
  if (unused.length > 0) {
    violations.push({
      check: "catalog-unused",
      severity: "warn",
      detail: `${unused.length} catalog entr(ies) referenced by no package: ${unused.join(", ")}`,
      fix: "Delete the entry from the `catalog:` block in pnpm-workspace.yaml.",
    });
  }

  return violations;
}

/**
 * A GitHub Action pinned by major tag drifts with nothing to show for it — no
 * build fails when `actions/checkout@v4` is three majors old. Renovate raises
 * the PRs; this check makes the drift visible locally too, and catches the case
 * where Renovate is not yet enabled on the repository at all.
 */
function checkWorkflowPins(): Violation[] {
  const workflows = globSync(".github/workflows/*.y*ml", { cwd: root });
  if (workflows.length === 0) return [];

  const unpinned: string[] = [];
  const shaPinned: string[] = [];

  for (const file of workflows) {
    const content = read(file) ?? "";
    for (const match of content.matchAll(/uses:\s*([\w.-]+\/[\w.-]+)@(\S+)/g)) {
      const [, action, ref] = match;
      if (/^[0-9a-f]{40}$/.test(ref)) shaPinned.push(`${action} (${file})`);
      else if (!/^v\d/.test(ref)) unpinned.push(`${action}@${ref} (${file})`);
    }
  }

  const violations: Violation[] = [];
  if (unpinned.length > 0) {
    violations.push({
      check: "action-pinning",
      severity: "warn",
      detail: `Action(s) referenced by a floating ref: ${[...new Set(unpinned)].join(", ")}`,
      fix: "Pin to a version tag (@v4) or a full commit SHA so Renovate can track it.",
    });
  }
  if (shaPinned.length > 0) {
    // Not a defect — recorded so a SHA pin is a visible decision rather than
    // something that quietly stops receiving updates.
    violations.push({
      check: "action-sha-pins",
      severity: "warn",
      detail: `SHA-pinned action(s), which only Renovate will ever move: ${[...new Set(shaPinned)].join(", ")}`,
      fix: "Confirm the pin is deliberate (supply-chain surface) and that Renovate is enabled to bump it.",
    });
  }
  return violations;
}

/**
 * The pnpm version must live only in `packageManager`. A second copy in a
 * workflow `version:` input means CI can silently run a different pnpm — and
 * therefore a different resolver — than the Dockerfile and every developer.
 */
function checkPnpmSingleSource(): Violation[] {
  const declared = readJson<{ packageManager?: string }>(
    "package.json",
  )?.packageManager;
  if (!declared) {
    return [
      {
        check: "pnpm-single-source",
        severity: "error",
        detail: "package.json has no `packageManager` field.",
        fix: 'Add "packageManager": "pnpm@<version>" so CI and Docker agree by construction.',
      },
    ];
  }

  // Scanned line-by-line rather than with a multi-line regex: the obvious
  // pattern here (`action-setup@...\n(?:\s+.*\n)*?\s+version:`) backtracks
  // catastrophically, because `\s` and `.` both match the same characters.
  const duplicates: string[] = [];
  for (const file of globSync(".github/workflows/*.y*ml", { cwd: root })) {
    const lines = (read(file) ?? "").split("\n");
    let inSetup = false;
    for (const line of lines) {
      if (line.includes("pnpm/action-setup@")) {
        inSetup = true;
        continue;
      }
      // The `with:` block ends at the next line indented no further than the
      // step's own `- name:` / `uses:` level.
      if (inSetup && /^\s*-\s/.test(line)) inSetup = false;
      if (inSetup && /^\s+version:\s*\S/.test(line)) {
        duplicates.push(file);
        inSetup = false;
      }
    }
  }

  if (duplicates.length === 0) return [];
  return [
    {
      check: "pnpm-single-source",
      severity: "warn",
      detail: `pnpm version restated in ${[...new Set(duplicates)].join(", ")} alongside packageManager (${declared})`,
      fix: "Drop the `version:` input; pnpm/action-setup reads packageManager from package.json.",
    },
  ];
}

// ---------------------------------------------------------------------------

export const depsCommand = new Command("deps")
  .description(
    "Report dependency drift, advisories and version-policy violations",
  )
  .option(
    "--ci",
    "Check local invariants only and exit non-zero on any error-severity violation",
  )
  .option("--majors", "List every package sitting behind a major version")
  .action((options: { ci?: boolean; majors?: boolean }) => {
    // Drift and advisories both hit the registry and take tens of seconds.
    // `--ci` needs neither: every invariant is answerable from the repo alone,
    // so the gate stays fast and cannot fail on a flaky network.
    const offline = options.ci === true;
    const violations: Violation[] = [];

    console.log(`\n${chalk.bold("Dharma Dependency Report")}\n`);

    if (!offline) {
      // --- Drift -----------------------------------------------------------
      const outdated =
        pnpmJson<Record<string, OutdatedEntry>>(
          "outdated --recursive --format json",
        ) ?? {};
      const drift: Drift[] = Object.entries(outdated)
        .filter(([, v]) => v.current && v.latest)
        .map(([name, v]) => ({
          name,
          current: v.current as string,
          latest: v.latest as string,
          kind: classify(v.current as string, v.latest as string),
        }));

      const majors = drift.filter((d) => d.kind === "major");
      const minors = drift.filter((d) => d.kind === "minor");
      const patches = drift.filter((d) => d.kind === "patch");

      console.log(chalk.bold("Drift"));
      console.log(chalk.gray("─".repeat(72)));
      console.log(
        `  ${chalk.red(`${majors.length} major`)}   ` +
          `${chalk.yellow(`${minors.length} minor`)}   ` +
          `${chalk.cyan(`${patches.length} patch`)}   ` +
          chalk.gray(`(${drift.length} packages behind)`),
      );

      if (options.majors && majors.length > 0) {
        console.log();
        for (const d of majors) {
          console.log(
            `  ${chalk.red("▲")} ${chalk.white(d.name.padEnd(42))}` +
              `${chalk.gray(d.current)} ${chalk.gray("→")} ${chalk.red(d.latest)}`,
          );
        }
      } else if (majors.length > 0) {
        console.log(chalk.gray("  Run with --majors to list them."));
      }

      // --- Advisories ------------------------------------------------------
      const audit = pnpmJson<{
        metadata?: { vulnerabilities?: Record<string, number> };
      }>("audit --json");

      console.log(`\n${chalk.bold("Advisories")}`);
      console.log(chalk.gray("─".repeat(72)));

      const vulns = audit?.metadata?.vulnerabilities;
      if (!vulns) {
        // Distinguish "could not read" from "nothing found". A security summary
        // that prints zeros because the call failed is worse than no summary.
        console.log(
          `  ${chalk.yellow("?")} pnpm audit produced no parsable report.`,
        );
        violations.push({
          check: "audit-readable",
          severity: "warn",
          detail:
            "Could not parse `pnpm audit --json`; advisory status is unknown.",
          fix: "Run `pnpm audit` directly and check for a registry or network failure.",
        });
      } else {
        console.log(
          `  ${chalk.red(`${vulns.critical ?? 0} critical`)}   ` +
            `${chalk.redBright(`${vulns.high ?? 0} high`)}   ` +
            `${chalk.yellow(`${vulns.moderate ?? 0} moderate`)}   ` +
            `${chalk.gray(`${vulns.low ?? 0} low`)}`,
        );
      }
      console.log();
    }

    // --- Invariants --------------------------------------------------------
    violations.push(
      ...checkLockfiles(),
      ...checkNodeVersions(),
      ...checkBiomeSchema(),
      ...checkCatalogCoverage(),
      ...checkWorkflowPins(),
      ...checkPnpmSingleSource(),
    );

    console.log(chalk.bold("Version policy"));
    console.log(chalk.gray("─".repeat(72)));

    if (violations.length === 0) {
      console.log(`  ${chalk.green("✓")} All invariants hold.`);
    } else {
      for (const v of violations) {
        const icon =
          v.severity === "error" ? chalk.red("✗") : chalk.yellow("⚠");
        console.log(`  ${icon} ${chalk.bold(v.check)}`);
        console.log(`    ${chalk.white(v.detail)}`);
        console.log(`    ${chalk.gray("fix:")} ${chalk.cyan(v.fix)}`);
      }
    }

    console.log();

    if (options.ci && violations.some((v) => v.severity === "error")) {
      console.log(chalk.red("Dependency policy violated — failing.\n"));
      process.exit(1);
    }
  });
