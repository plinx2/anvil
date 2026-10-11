import { defineCommand } from 'citty';
import type { CliDeps } from '../cli-deps';
import { ticketDependencyAddCommand } from './ticket-dependency-add-command';
import { ticketDependencyRemoveCommand } from './ticket-dependency-remove-command';

/** anvil ticket dependency — 依存のコマンドの群 */
export const ticketDependencyGroup = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'dependency', description: '依存' },
    subCommands: {
      add: ticketDependencyAddCommand(deps),
      remove: ticketDependencyRemoveCommand(deps),
    },
  });
