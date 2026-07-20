import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      ['**/hooks/**/*.test.ts', 'jsdom'],
      ['**/components/**/*.test.ts', 'jsdom'],
      ['**/pages/**/*.test.ts', 'jsdom'],
      ['**/tests/**', 'jsdom'],
      ['**/*.{test,spec}.{tsx,jsx}', 'jsdom'],
    ],
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.test.tsx',
      'src/**/__tests__/**/*.test.ts',
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'api/**/__tests__/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}', 'api/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/__tests__/**',
        'src/test-fixtures/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        '**/*.module.css',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
