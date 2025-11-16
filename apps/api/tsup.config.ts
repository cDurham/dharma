import { defineConfig } from "tsup";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Monorepo: read deps from the repo root package.json so we can externalize them
const ROOT = resolve(__dirname, "../../");
const rootPkgJsonPath = resolve(ROOT, "package.json");
const rootPkg = JSON.parse(fs.readFileSync(rootPkgJsonPath, "utf8")) as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

// Optional/peer deps that Nest loads conditionally; keep them external to avoid resolution errors
const nestOptionalExternals = [
  "@apollo/gateway",
  "@apollo/subgraph",
  "@apollo/subgraph/package.json",
  "@apollo/subgraph/dist/directives",
  "@as-integrations/fastify",
  "@nestjs/websockets/socket-module",
  "class-transformer",
  "class-transformer/storage",
  "class-validator",
  "ts-morph",
  "ioredis",
  "nats",
  "mqtt",
  "amqplib",
  "amqp-connection-manager",
  "@grpc/grpc-js",
  "@grpc/proto-loader",
];

const external = Array.from(
  new Set([
    ...(Object.keys(rootPkg.dependencies ?? {})),
    ...(Object.keys(rootPkg.peerDependencies ?? {})),
    ...nestOptionalExternals,
  ])
);

export default defineConfig(() => ({
  entry: ["src/index.ts"],          // tsup runs with CWD=apps/api
  outDir: "../../dist/apps/api",
  format: ["esm"],
  platform: "node",
  target: "node22",
  sourcemap: true,
  splitting: false,
  clean: true,

  // Force .js extension so the runner can use dist/apps/api/index.js (and stays ESM via "type":"module")
  outExtension: () => ({ js: ".js" }),

  // Keep DI + metadata intact
  minify: false,
  treeshake: false,
  dts: false,

  // Ensure reflect-metadata loads first even after bundling
  banner: { js: `import "reflect-metadata";` },

  // Treat ALL bare imports (e.g. "@nestjs/core") as external so esbuild doesn't walk node_modules.
  esbuildOptions(options) {
    options.packages = "external";
    options.mainFields = ["module", "main"];
    options.conditions = ["node", "import", "default"];
    // If you later choose to inline SDL files and use `typeDefs`, uncomment:
    // options.loader = { ".graphql": "text" };
  },

  // Explicit external list (monorepo & optional peer deps)
  external,

  // If you keep SDL files on disk and want them next to the build, put them under src/graphql
  // and uncomment the line below to copy that folder:
  // publicDir: "src/graphql",

  // No onSuccess here; we'll let Nx run Node so path/cwd are always correct.
}));

