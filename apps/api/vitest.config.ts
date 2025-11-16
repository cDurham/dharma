import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.{test,spec}.ts", "src/__test__/**/*.{test,spec}.ts"],
    coverage: {
      provider: "v8",
      reportsDirectory: "../../coverage/api",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.{test,spec}.ts", "src/__test__/**"],
    },
    setupFiles: ["./vitest.setup.ts"],
  },
});

