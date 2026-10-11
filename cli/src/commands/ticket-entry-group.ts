import { defineCommand } from 'citty';
import type { CliDeps } from '../cli-deps';
import { ticketEntryAddCommand } from './ticket-entry-add-command';

/** anvil ticket entry — エントリのコマンドの群 */
export const ticketEntryGroup = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'entry', description: 'エントリ' },
    subCommands: {
      add: ticketEntryAddCommand(deps),
    },
  });
