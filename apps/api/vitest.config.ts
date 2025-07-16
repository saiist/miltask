import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@otaku-secretary/database': path.resolve(__dirname, '../../packages/database/src'),
      '@otaku-secretary/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
});