import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({base:'./',build:{outDir:'enemy-dist',chunkSizeWarningLimit:1500,rollupOptions:{input:resolve(import.meta.dirname,'enemy-preview.html'),output:{inlineDynamicImports:true}}}});
