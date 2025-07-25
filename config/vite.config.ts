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
    host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost',
    port: 5173,
    strictPort: true, // Ensure Vite fails if the port is already in use
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
  },
});
