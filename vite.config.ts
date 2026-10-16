import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 1500 },
  server: { host: '127.0.0.1', port: 5175 },
  preview: { host: '127.0.0.1', port: 5175 },
});
