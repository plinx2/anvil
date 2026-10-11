// OpenAPI の文書を書き出す(GUI のクライアントは、これから作る)。実行: pnpm openapi
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { anvilConfigFromEnv, createAnvil } from '@anvil/composition';
import { createHttpApp } from './create-http-app';
import { OPENAPI_INFO } from './openapi-info';

// 文書だけが要るので、データベースはメモリ、エージェントは何もしない
const anvil = createAnvil({ ...anvilConfigFromEnv(), dbFile: ':memory:', agent: 'noop', pullRequests: 'noop' });
const document = createHttpApp(anvil.service).getOpenAPI31Document(OPENAPI_INFO);

const output = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'openapi.json');
fs.writeFileSync(output, `${JSON.stringify(document, null, 2)}\n`);
console.log(`wrote ${output}`);
