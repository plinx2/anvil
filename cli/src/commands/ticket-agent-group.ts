import { defineCommand } from 'citty';
import type { CliDeps } from '../cli-deps';
import { ticketAgentFocusCommand } from './ticket-agent-focus-command';
import { ticketAgentStartCommand } from './ticket-agent-start-command';

/** anvil ticket agent — エージェントのコマンドの群 */
export const ticketAgentGroup = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'agent', description: 'エージェント' },
    subCommands: {
      focus: ticketAgentFocusCommand(deps),
      start: ticketAgentStartCommand(deps),
    },
  });
