import { defineCommand } from 'citty';
import type { CliDeps } from '../cli-deps';
import { repoAddCommand } from './repo-add-command';
import { repoUpdateCommand } from './repo-update-command';

/** anvil repo — リポジトリのコマンドの群 */
export const repoGroup = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'repo', description: 'リポジトリ' },
    subCommands: {
      add: repoAddCommand(deps),
      update: repoUpdateCommand(deps),
    },
  });
