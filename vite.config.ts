import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        "404": resolve(__dirname, '404.html')
      }
    }
  },
  plugins: [react()],
  test: {
    coverage: {
      reporter: ['text', 'json-summary', 'json']
    }
  }
})
