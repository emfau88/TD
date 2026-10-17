import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({base:'./',build:{outDir:'succubus-dist',chunkSizeWarningLimit:1500,rollupOptions:{input:resolve(import.meta.dirname,'succubus-preview.html'),output:{inlineDynamicImports:true}}}});
