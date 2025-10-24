import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/web',
  plugins: [nxViteTsPaths(), react()],
  server: {
    port: 4200,
    host: '0.0.0.0',
    sourcemapIgnoreList: false
  },
  preview: {
    port: 4300,
    host: '0.0.0.0'
  },
  build: {
    outDir: '../../dist/apps/web',
    reportCompressedSize: true,
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
});
