import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [tailwindcss()],
  envDir: '../',
  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, './src/lib')
    }
  },
  server: {
    watch: {
      ignored: ['**/.nfs*'],
      usePolling: true,
      interval: 1000
    },
    port: 8080,
    proxy: {
      "/api": {
        target: 'http://localhost:3000/',
        rewrite: (path) => path.replace(/^\/api/, ''),
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
  }
});
