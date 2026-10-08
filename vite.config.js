import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? './' : '/',
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: false,
    strictPort: false,
    allowedHosts: ['pf-bp-2271-68c7bd46d31082eaaf5be646.devzonecg.ktern.com','contract-management-gzi7.onrender.com', 'localhost'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
}));
