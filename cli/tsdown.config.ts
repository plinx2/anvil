import { defineConfig } from 'tsdown';

/**
 * anvil コマンドのビルド。bin(`dist/anvil.mjs`)は、ビルドの成果物。
 * ワークスペースのパッケージ(ts のソース)も、依存のパッケージも、すべて 1 つのファイルにまとめる(node の組み込みだけが外)。GUI は、dist/gui に置く。
 */
export default defineConfig({
  entry: { anvil: 'src/main.ts' },
  format: 'esm',
  platform: 'node',
  target: 'node22',
  outDir: 'dist',
  clean: true,
  // GUI のビルドの成果物を、dist/gui に同梱する(dist だけで、動く)。先に GUI をビルドするため、@anvil/gui に依存している
  copy: [{ from: '../apps/gui/dist', to: 'dist', rename: 'gui' }],
  deps: { alwaysBundle: [/.*/], onlyBundle: false },
});
