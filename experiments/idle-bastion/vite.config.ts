import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root,
  base: './',
  publicDir: false,
  server: { host: '127.0.0.1', port: 5190, strictPort: true },
  preview: { host: '127.0.0.1', port: 5191, strictPort: true },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      input: {
        battle: fileURLToPath(new URL('./index.html', import.meta.url)),
        enemyLab: fileURLToPath(new URL('./enemy-lab.html', import.meta.url)),
        enemyCredits: fileURLToPath(new URL('./enemy-credits.html', import.meta.url)),
        enemies: fileURLToPath(new URL('./enemy-check.html', import.meta.url)),
        layout: fileURLToPath(new URL('./layout.html', import.meta.url)),
        assets: fileURLToPath(new URL('./asset-check.html', import.meta.url)),
        ilyra: fileURLToPath(new URL('./ilyra-check.html', import.meta.url)),
        tavern: fileURLToPath(new URL('./tavern-check.html', import.meta.url)),
        audioCredits: fileURLToPath(new URL('./audio-credits.html', import.meta.url)),
        voiceCheck: fileURLToPath(new URL('./voice-check.html', import.meta.url)),
        effectsCheck: fileURLToPath(new URL('./effects-check.html', import.meta.url)),
        mara: fileURLToPath(new URL('./mara-check.html', import.meta.url)),
      },
    },
  },
});
