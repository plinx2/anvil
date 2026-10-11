import { defineCommand } from 'citty';
import type { CliDeps } from '../cli-deps';
import { projectContextCommand } from './project-context-command';
import { projectCreateCommand } from './project-create-command';
import { projectDeleteCommand } from './project-delete-command';
import { projectListCommand } from './project-list-command';

/** anvil project — プロジェクトのコマンドの群 */
export const projectGroup = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'project', description: 'プロジェクト' },
    subCommands: {
      context: projectContextCommand(deps),
      create: projectCreateCommand(deps),
      delete: projectDeleteCommand(deps),
      list: projectListCommand(deps),
    },
  });
