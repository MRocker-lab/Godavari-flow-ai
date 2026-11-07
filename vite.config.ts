import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('leaflet')) return 'vendor-maps';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (
              id.includes('react') ||
              id.includes('zustand') ||
              id.includes('scheduler')
            ) {
              return 'vendor-react';
            }
          }
          if (id.includes('/src/pages/command/') || id.includes('\\src\\pages\\command\\')) {
            return 'portal-command';
          }
          if (id.includes('/src/pages/pilgrim/') || id.includes('\\src\\pages\\pilgrim\\')) {
            return 'portal-pilgrim';
          }
          return undefined;
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/testSetup.ts',
  },
});

