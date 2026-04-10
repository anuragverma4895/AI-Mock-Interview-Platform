import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
<<<<<<< HEAD
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
=======

export default defineConfig({
  plugins: [react()],
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
  server: {
    port: 3000,
    proxy: {
      '/api': {
<<<<<<< HEAD
        target: 'http://localhost:5005',
=======
        target: 'http://localhost:5000',
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
        changeOrigin: true,
      },
    },
  },
});