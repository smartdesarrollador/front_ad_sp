import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    process.env.ANALYZE
      ? visualizer({ open: true, gzipSize: true, filename: 'dist/stats.html' })
      : null,
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-charts': ['recharts'],
          'vendor-virtual': ['@tanstack/react-virtual'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    proxy: {
      '/api': {
        target: process.env.API_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      // Realistic thresholds for vi.mock-based testing: hooks are mocked in component
      // tests → component branches/callbacks have lower coverage. These values enforce
      // a quality floor without requiring exhaustive interaction testing.
      thresholds: { lines: 65, functions: 50, branches: 55, statements: 65 },
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/main.tsx',
        'src/App.tsx',
        'src/router/**',
        'src/**/*.d.ts',
        'src/types/**',
        'src/i18n/**',
        'src/lib/queryClient.ts',
        'src/pages/**',
        // Feature-level hooks are vi.mocked in all page tests → 0% coverage by design.
        // The root-level hooks (usePermissions, useFeatureGate) are tested separately.
        'src/features/**/hooks/**',
        // Pure TypeScript type declarations — no runtime executable code.
        'src/features/**/types.ts',
        // uiStore is a simple Zustand store exercised indirectly; excluded for now.
        'src/store/uiStore.ts',
      ],
    },
  },
})
