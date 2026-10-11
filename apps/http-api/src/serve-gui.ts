import fs from 'node:fs';
import path from 'node:path';
import type { HttpApp } from './http-app';

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

/**
 * ビルドした GUI を配信する(SPA: 知らないパスは index.html を返す)。
 * GUI のコードには依存しない。所定のディレクトリに、ビルドの成果物が置かれていればよい。
 */
export function serveGui(app: HttpApp, guiDir: string): void {
  app.get('*', (c) => {
    if (c.req.path.startsWith('/api/')) return c.json({ error: '見つからない', code: 'not_found' }, 404);

    const requested = path.join(guiDir, c.req.path === '/' ? 'index.html' : c.req.path.slice(1));
    const inside = requested.startsWith(guiDir) && fs.existsSync(requested) && fs.statSync(requested).isFile();
    const file = inside ? requested : path.join(guiDir, 'index.html');
    if (!fs.existsSync(file)) return c.text('GUI がビルドされていない(pnpm build)', 404);

    return c.body(fs.readFileSync(file), 200, { 'content-type': CONTENT_TYPES[path.extname(file)] ?? 'application/octet-stream' });
  });
}
