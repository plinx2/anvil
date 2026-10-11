import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    // node:sqlite は実験的な組み込みモジュールなので、vite の変換に通さない
    server: { deps: { external: [/node:sqlite/] } },
    testTimeout: 30000,
  },
});
