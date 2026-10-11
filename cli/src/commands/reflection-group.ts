import { defineCommand } from 'citty';
import type { CliDeps } from '../cli-deps';
import { reflectionDecideCommand } from './reflection-decide-command';
import { reflectionListCommand } from './reflection-list-command';

/** anvil reflection — 振り返りのコマンドの群 */
export const reflectionGroup = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'reflection', description: '振り返り' },
    subCommands: {
      decide: reflectionDecideCommand(deps),
      list: reflectionListCommand(deps),
    },
  });
