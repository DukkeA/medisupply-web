import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
    include: ['**/*.{spec,test}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    typecheck: {
      enabled: true
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/src/components/ui/**' // Exclude shadcn UI components
    ],
    coverage: {
      provider: 'v8',
      exclude: [
        'src/components/ui/**',
        'src/app/**/layout.tsx', // Exclude layouts temporarily
        'src/app/**/page.tsx', // Exclude pages temporarily
        'src/app/**/loading.tsx', // Exclude loading components
        'src/app/**/error.tsx', // Exclude error components
        'src/app/**/not-found.tsx', // Exclude not-found components
        'src/i18n/**', // Exclude i18n configuration
        'src/messages/**', // Exclude translation files
        'middleware.ts', // Exclude Next.js middleware
        '.next/**', // Exclude Next.js build files
        'out/**', // Exclude Next.js static export output
        'src/__tests__/**', // Exclude test utilities
        'src/lib/**', // Exclude lib utilities (add tests if needed)
        'src/generated/**', // Exclude generated API code
        '**/index.ts', // Exclude all index/barrel files
        '**/index.tsx', // Exclude all index/barrel files
        '**/*.config.*',
        '**/*.d.ts'
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
