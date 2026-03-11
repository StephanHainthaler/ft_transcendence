import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from "vite";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  compilerOptions: {
  },
  kit: {
    adapter: adapter({
      precompress: false,
      strict: true,
      pages: './dist',
      assets: './dist',
      fallback: 'index.html',
    }),
    prerender: {
      crawl: false
    },
    alias: {
      "@lib/*": "./src/lib/*",
      "$lib/*": "./src/lib/*",
      "@shared/*": "../shared/*",
    }
  },
  vite: defineConfig({
    build: {
      outDir: "./dist",
      emptyOutDir: true,
      sourcemap: false,
    },
    server: {
      port: 8080,
      host: "0.0.0.0",
    },
  }),
};

export default config;
