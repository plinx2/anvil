import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    // node:sqlite は実験的な組み込みモジュールなので、vite の変換に通さない
    server: { deps: { external: [/node:sqlite/] } },
    testTimeout: 30000,
    // 統合テストで、usecase / service / adapter のどこが通っているかを見る(`pnpm test:coverage`)
    coverage: {
      provider: 'v8',
      allowExternal: true,
      include: ['**/packages/*/src/**', '**/packages/adapter/*/src/**'],
      exclude: ['**/index.ts', '**/*.d.ts'],
      reporter: ['text-summary', 'json-summary'],
      reportsDirectory: 'coverage',
    },
  },
});
