#!/usr/bin/env node
// anvil コマンド。サーバーを使わず、ユースケースを直接実行する(同じ機能を、サーバーの HTTP API、MCP でも提供している)。
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { anvilConfigFromEnv, createAnvil } from '@anvil/composition';
import { Actor, AnvilError } from '@anvil/entity';
import { newRequestContext } from '@anvil/service';
import { runMain } from 'citty';
import type { CliDeps } from './cli-deps';
import { rootCommand } from './root-command';

// GUI の置き場。成果物に同梱した dist/gui
const here = path.dirname(fileURLToPath(import.meta.url));
const guiDir = path.join(here, 'gui');

const anvil = createAnvil(anvilConfigFromEnv());
const deps: CliDeps = {
  service: anvil.service,
  ctx: newRequestContext(Actor.human()),
  guiDir,
  print: (text) => console.log(text),
  fail: (e) => {
    console.error(e instanceof AnvilError ? `エラー(${e.code}): ${e.message}` : e);
    process.exitCode = 1;
  },
};

await runMain(rootCommand(deps));
await anvil.tasks.idle();
