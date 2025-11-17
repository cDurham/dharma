import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    root: __dirname,
    include: ["src/**/*.{test,spec}.ts", "src/__test__/**/*.{test,spec}.ts"],
    coverage: {
      provider: "v8",
      reportsDirectory: join(__dirname, "../../coverage/api"),
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.{test,spec}.ts", "src/__test__/**"],
    },
    setupFiles: [join(__dirname, "vitest.setup.ts")],
  },
});
