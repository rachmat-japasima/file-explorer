import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@windows-explorer/shared': resolve(__dirname, '../packages/shared/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})