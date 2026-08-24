/// <reference types="vitest/config" />
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import swc from "unplugin-swc";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Nest DI needs design:paramtypes metadata; esbuild, vitest's default
  // transform, does not emit it.
  plugins: [
    swc.vite({
      module: { type: "es6" },
      jsc: {
        target: "es2022",
        parser: { syntax: "typescript", decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
      },
    }),
  ],
  test: {
    environment: "node",
    globals: true,
    root: __dirname,
    include: ["src/**/*.{test,spec}.ts", "src/__test__/**/*.{test,spec}.ts"],
    globalSetup: join(__dirname, "vitest.global-setup.ts"),
    coverage: {
      provider: "v8",
      reportsDirectory: join(__dirname, "../../coverage/api"),
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.{test,spec}.ts", "src/__test__/**"],
    },
    setupFiles: [join(__dirname, "vitest.setup.ts")],
  },
});
