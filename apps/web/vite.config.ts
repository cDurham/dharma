import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: projectRoot,
  cacheDir: "../../node_modules/.vite/web",
  plugins: [react()],
  server: {
    port: 4200,
    host: "0.0.0.0",
    sourcemapIgnoreList: false,
  },
  preview: {
    port: 4300,
    host: "0.0.0.0",
  },
  build: {
    outDir: "../../dist/apps/web",
    target: "es2022",
    reportCompressedSize: true,
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
