import { fileURLToPath } from 'node:url';
import { posix } from 'node:path';
import { defineConfig, loadEnv } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  const preview = loadEnv(mode, root, '').VITE_FEATURE_PREVIEW === '1';
  const tavernPreview = preview && loadEnv(mode, root, '').VITE_TAVERN_PREVIEW === '1';
  return {
  plugins: [{
    name: 'inline-first-paint-loading-css',
    transformIndexHtml: {
      order: 'post',
      handler(html, context) {
        if (!context.bundle || !context.filename.replaceAll('\\', '/').endsWith('/index.html')) return html;
        // This entry stylesheet contains only the loader. Avoid a render-blocking round trip.
        return html.replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (tag, href: string) => {
          const path = href.replace(/^\.\//, '');
          const asset = context.bundle?.[path];
          if (!asset || asset.type !== 'asset' || typeof asset.source !== 'string') return tag;
          const css = asset.source.replace(/url\(([^)]+)\)/g, (original, raw: string) => {
            const url = raw.replace(/^['"]|['"]$/g, '');
            if (/^(?:data:|https?:|\/)/.test(url)) return original;
            return `url("./${posix.join(posix.dirname(path), url)}")`;
          });
          return `<style data-boot-style>${css}</style>`;
        });
      },
    },
  }, {
    name: 'tower-preview-ui',
    transformIndexHtml(html, context) {
      if (!preview || !context.filename.replaceAll('\\', '/').endsWith('/index.html')) return html;
      return tavernPreview ? html.replace('</title>', ' · Tavern test branch</title>')
        .replace('<!-- tower-preview-menu -->', '<p><a href="./tavern-test.html" style="color:#c5e7ed">Taverne testen / Tavern test selection</a></p>')
        : html.replace('</title>', ' · Tower test branch</title>')
          .replace('<!-- tower-preview-menu -->', '<p><a href="./tower-test.html" style="color:#c5e7ed">Tower test branch · Testauswahl / Test selection</a></p>');
    },
  }],
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
        ...(preview ? { towerTest: fileURLToPath(new URL('./tower-test.html', import.meta.url)) } : {}),
        ...(tavernPreview ? {
          tavernTest: fileURLToPath(new URL('./tavern-test.html', import.meta.url)),
          tavernCounterCheck: fileURLToPath(new URL('./tavern-counter-check.html', import.meta.url)),
        } : {}),
        featureCheck: fileURLToPath(new URL('./feature-check.html', import.meta.url)),
      },
    },
  },
  };
});
