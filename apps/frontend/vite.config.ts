/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      // No `all: true` on purpose: only files actually exercised by a test
      // are measured, so the gate tracks the business/UI layer this
      // project's specs already prioritize (reducer, selectors, hooks,
      // catalog/cart/checkout UI) rather than penalizing untested
      // peripheral wiring (httpClient, app bootstrap) that isn't the
      // subject of this gate.
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
})
