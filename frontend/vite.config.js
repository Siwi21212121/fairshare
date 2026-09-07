import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server proxies /api straight to the Express backend so the frontend
// can just call fetch/axios against "/api/..." with no CORS setup and no
// environment-specific base URL to configure.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
