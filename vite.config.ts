import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Provide polyfill for global in browser environment if needed by stellar-sdk
    'global': 'globalThis',
  },
  server: {
    port: 3000,
    host: true,
  },
});
