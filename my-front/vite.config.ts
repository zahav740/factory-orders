import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './src/core-ui'),
      '@api': path.resolve(__dirname, './src/api-client'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@ui': path.resolve(__dirname, './src/ui-components'),
      '@orders': path.resolve(__dirname, './src/order-management'),
      '@machine': path.resolve(__dirname, './src/machine-scheduler'),
      '@calculator': path.resolve(__dirname, './src/schedule-calculator'),
      '@viewer': path.resolve(__dirname, './src/document-viewer'),
      // Добавляем алиасы для @factory/...
      '@factory/api-client': path.resolve(__dirname, './src/api-client'),
      '@factory/utils': path.resolve(__dirname, './src/utils'),
      '@factory/ui-components': path.resolve(__dirname, './src/ui-components')
    }
  }
});