#!/usr/bin/env node
import ts from "typescript";
import { globby } from "globby";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Root of the repo
const ROOT = resolve(__dirname, "../../");
// Allow --src override (default to API src)
const SRC = resolve(ROOT, process.argv[2] ?? "apps/api/src");

// All TS files, skip .d.ts
const FILE_GLOBS = ["**/*.ts", "!**/*.d.ts"];

// Helper: has explicit extension already?
const HAS_EXT_RE = /\.[a-zA-Z0-9]+$/;

// Normalize spec like ".", "..", "a/.", "a/.."
function normalizeDotLike(spec: string): string {
  if (spec === ".") return "./index";
  if (spec === "..") return "../index";
  if (spec.endsWith("/.")) return spec.slice(0, -2) + "/index";
  if (spec.endsWith("/..")) return spec.slice(0, -3) + "/index";
  return spec;
}

// Try to resolve a relative specifier to file or index.*
// Return runtime specifier ending in .js if found; otherwise null.
function resolveTarget(spec: string, basedir: string): string | null {
  // only relative
  if (!(spec.startsWith("./") || spec.startsWith("../") || spec === "." || spec === "..")) return null;

  // normalize ".", "..", "/.", "/.."
  let rel = normalizeDotLike(spec);

  // if it now has an explicit ext, we're done
  if (HAS_EXT_RE.test(rel)) return null;

  const candidates = [
    `${rel}.ts`,
    `${rel}.tsx`,
    `${rel}.mts`,
    `${rel}.cts`,
    `${rel}.js`,
    `${rel}.mjs`,
    `${rel}/index.ts`,
    `${rel}/index.tsx`,
    `${rel}/index.mts`,
    `${rel}/index.cts`,
    `${rel}/index.js`,
    `${rel}/index.mjs`,
  ];

  for (const candidate of candidates) {
    const abs = resolve(basedir, candidate);
    if (existsSync(abs)) {
      if (/\/index\.(t|j|m)c?sx?$/.test(candidate)) {
        // ensure single /index.js form regardless of how it was referenced
        const base = rel.replace(/\/+$/, "").replace(/\/index$/, "");
        const prefix = base.length ? base : ".";
        return `${prefix}/index.js`;
      }
      return `${rel}.js`;
    }
  }
  return null;
}

// Patch a single file by rewriting string literal module specifiers
function processFile(file: string) {
  const sourceText = readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, sourceText, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);

  const patches: { start: number; end: number; text: string }[] = [];
  const warnings: string[] = [];
  const baseDir = dirname(file);

  const patchStringLiteral = (lit: ts.StringLiteralLike) => {
    const original = lit.text;
    // Only relative (including "." / "..")
    const isRelative = original === "." || original === ".." || original.startsWith("./") || original.startsWith("../");
    if (!isRelative) return;

    // Already extensioned?
    if (HAS_EXT_RE.test(original)) return;

    const resolved = resolveTarget(original, baseDir);
    if (!resolved) {
      warnings.push(`Could not resolve ${original} in ${file}`);
      return;
    }

    // Replace literal (preserve quote char)
    const start = lit.getStart(sf);
    const end = lit.getEnd();
    const quote = sourceText[start]; // ' or "
    patches.push({ start, end, text: `${quote}${resolved}${quote}` });
  };

  const visit = (node: ts.Node): void => {
    // import ... from 'x'
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      patchStringLiteral(node.moduleSpecifier);
    }
    // export ... from 'x' / export * from 'x'
    else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      patchStringLiteral(node.moduleSpecifier);
    }
    // dynamic import('x')
    else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const [arg] = node.arguments;
      if (arg && ts.isStringLiteralLike(arg)) patchStringLiteral(arg);
    }
    // import foo = require('x')  (rare in ESM code, but harmless to support)
    else if (ts.isImportEqualsDeclaration(node) && node.moduleReference && ts.isExternalModuleReference(node.moduleReference)) {
      const exp = node.moduleReference.expression;
      if (exp && ts.isStringLiteral(exp)) patchStringLiteral(exp);
    }

    ts.forEachChild(node, visit);
  };

  visit(sf);

  if (patches.length === 0) {
    return { updated: sourceText, edits: 0, warnings };
  }

  // Apply patches from the end to avoid shifting offsets
  patches.sort((a, b) => b.start - a.start);
  let updated = sourceText;
  for (const p of patches) {
    updated = updated.slice(0, p.start) + p.text + updated.slice(p.end);
  }
  return { updated, edits: patches.length, warnings };
}

(async () => {
  const files = await globby(FILE_GLOBS, { cwd: SRC, absolute: true });
  let totalEdits = 0;
  let updatedFiles = 0;
  const unresolved: string[] = [];

  for (const file of files) {
    const res = processFile(file);
    if (!res) continue;
    const { updated, edits, warnings } = res;

    if (edits > 0) {
      writeFileSync(file, updated, "utf8");
      updatedFiles++;
      totalEdits += edits;
      console.log(`✓ ${file.replace(ROOT, "")} (${edits} edits)`);
    }
    unresolved.push(...warnings);
  }

  console.log(`\n✅ Updated ${updatedFiles} file(s), ${totalEdits} import(s).`);
  if (unresolved.length) {
    console.warn(`\n⚠️  ${unresolved.length} unresolved specifier(s):`);
    for (const w of unresolved) console.warn(" - " + w);
  }
})();

