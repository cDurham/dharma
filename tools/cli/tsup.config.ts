import { defineConfig } from "tsup";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: [resolve(__dirname, "src/index.ts")],
  format: ["esm"],
  platform: "node",
  target: "node22",
  sourcemap: true,
  clean: true,
  outDir: resolve(__dirname, "dist"),
  banner: {
    js: "#!/usr/bin/env node"
  },
  shims: false,
  splitting: false
});

