import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
  envDir: '../',
  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, './src/lib'),
      '@shared': path.resolve(__dirname, '../shared')
    }
  },
  server: {
    watch: {
      ignored: ['**/.nfs*'],
      usePolling: true,
      interval: 1000
    },
    port: 8080,
    host: '0.0.0.0',
    proxy: {
      "/api": {
        target: 'http://localhost:3000/',
        rewrite: (path) => path.replace(/^\/api/, ''),
        changeOrigin: true,
        ws: true,
      },
    }
  },
  build: {
    target: 'esnext',
    sourcemap: 'inline',
  },
  logLevel: 'error',
});
