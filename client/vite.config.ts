import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  root: r('.'),
  plugins: [react()],
  resolve: { alias: { '@': r('./src'), '@shared': r('../shared') } },
  css: { postcss: r('./postcss.config.cjs') },
  server: { port: 5173, proxy: { '/api': 'http://localhost:5000' } },
  build: {
    outDir: r('./dist'),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          map: ['leaflet', 'react-leaflet'],
          gsap: ['gsap'],
        },
      },
    },
  },
});
