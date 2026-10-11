import { defineCommand } from 'citty';
import type { CliDeps } from '../cli-deps';
import { ticketAdvanceCommand } from './ticket-advance-command';
import { ticketAgentGroup } from './ticket-agent-group';
import { ticketAnswerCommand } from './ticket-answer-command';
import { ticketAskCommand } from './ticket-ask-command';
import { ticketAutoGateCommand } from './ticket-auto-gate-command';
import { ticketCreateCommand } from './ticket-create-command';
import { ticketDependencyGroup } from './ticket-dependency-group';
import { ticketDiscardCommand } from './ticket-discard-command';
import { ticketEntriesCommand } from './ticket-entries-command';
import { ticketEntryGroup } from './ticket-entry-group';
import { ticketGateGroup } from './ticket-gate-group';
import { ticketPrGroup } from './ticket-pr-group';
import { ticketRollbackCommand } from './ticket-rollback-command';
import { ticketShowCommand } from './ticket-show-command';
import { ticketStartCommand } from './ticket-start-command';
import { ticketUpdateCommand } from './ticket-update-command';

/** anvil ticket — チケットのコマンドの群 */
export const ticketGroup = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'ticket', description: 'チケット' },
    subCommands: {
      advance: ticketAdvanceCommand(deps),
      agent: ticketAgentGroup(deps),
      answer: ticketAnswerCommand(deps),
      ask: ticketAskCommand(deps),
      'auto-gate': ticketAutoGateCommand(deps),
      create: ticketCreateCommand(deps),
      dependency: ticketDependencyGroup(deps),
      discard: ticketDiscardCommand(deps),
      entries: ticketEntriesCommand(deps),
      entry: ticketEntryGroup(deps),
      gate: ticketGateGroup(deps),
      pr: ticketPrGroup(deps),
      rollback: ticketRollbackCommand(deps),
      show: ticketShowCommand(deps),
      start: ticketStartCommand(deps),
      update: ticketUpdateCommand(deps),
    },
  });
