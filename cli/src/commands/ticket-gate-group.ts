import { defineCommand } from 'citty';
import type { CliDeps } from '../cli-deps';
import { ticketGateDesignCommand } from './ticket-gate-design-command';
import { ticketGateDoneCommand } from './ticket-gate-done-command';
import { ticketGateImplCommand } from './ticket-gate-impl-command';

/** anvil ticket gate — ゲートの突破のコマンドの群 */
export const ticketGateGroup = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'gate', description: 'ゲートの突破' },
    subCommands: {
      design: ticketGateDesignCommand(deps),
      done: ticketGateDoneCommand(deps),
      impl: ticketGateImplCommand(deps),
    },
  });
