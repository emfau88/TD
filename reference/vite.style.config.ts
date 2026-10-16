import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({base:'./',build:{outDir:'style-dist',chunkSizeWarningLimit:1500,rollupOptions:{input:resolve(import.meta.dirname,'style.html'),output:{inlineDynamicImports:true}}}});
