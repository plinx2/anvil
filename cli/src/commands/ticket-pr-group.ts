import { defineCommand } from 'citty';
import type { CliDeps } from '../cli-deps';
import { ticketPrRebuildCommand } from './ticket-pr-rebuild-command';

/** anvil ticket pr — PRのコマンドの群 */
export const ticketPrGroup = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'pr', description: 'PR' },
    subCommands: {
      rebuild: ticketPrRebuildCommand(deps),
    },
  });
