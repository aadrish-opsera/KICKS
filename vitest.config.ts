import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    environmentMatchGlobs: [['**/*.{test,spec}.{tsx,jsx}', 'jsdom']],
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'tests/**/*.test.ts',
      'src/**/__tests__/**/*.test.ts',
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'api/**/__tests__/**/*.test.ts',
    ],
  },
})
