// HTTP API の実行。anvil を組み立て、HTTP で提供する。
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { anvilConfigFromEnv, createAnvil } from '@anvil/composition';
import { serve } from '@hono/node-server';
import { createHttpApp } from './create-http-app';

const here = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.ANVIL_HTTP_PORT ?? 4730);
// GUI のビルドの成果物の置き場(約束)。既定は、隣の apps/gui/dist
const guiDir = process.env.ANVIL_GUI_DIR ?? path.resolve(here, '..', '..', 'gui', 'dist');

const config = anvilConfigFromEnv();
const anvil = createAnvil(config);

serve({ fetch: createHttpApp(anvil.service, { guiDir }).fetch, port, hostname: '127.0.0.1' }, () => {
  console.log(`anvil HTTP API: http://127.0.0.1:${port}  (OpenAPI: /openapi.json、GUI: ${guiDir})`);
  console.log(`  データ: ${config.home}  エージェント: ${config.agent}  PR: ${config.pullRequests}`);
});
