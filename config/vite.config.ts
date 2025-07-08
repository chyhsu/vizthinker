import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, '..'),
  build: {
    outDir: resolve(__dirname, '../dist'),
  },
  server: {
    port: 5173,
    strictPort: true, // Ensure Vite fails if the port is already in use
  },
});
