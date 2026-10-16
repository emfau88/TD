import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({base:'./',build:{outDir:'woodland-dist',chunkSizeWarningLimit:1500,rollupOptions:{input:resolve(import.meta.dirname,'woodland.html'),output:{inlineDynamicImports:true}}}});
