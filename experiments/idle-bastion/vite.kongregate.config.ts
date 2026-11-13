import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

/** Self-contained game only; no galleries, test starters or review media. */
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  publicDir: false,
  define: { 'import.meta.env.VITE_KONGREGATE': JSON.stringify('1') },
  build: {
    outDir: 'dist-kongregate',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600,
    rollupOptions: { input: fileURLToPath(new URL('./index.html', import.meta.url)) },
  },
});
