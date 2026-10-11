import { State, type Ticket } from '@anvil/entity';
import type { EndAgents } from '../agent/end-agents';
import type { LaunchAgent } from '../agent/launch-agent';
import type { CleanUpWorktrees } from '../branch/clean-up-worktrees';
import type { NotifyDependents } from '../dependency/notify-dependents';
import type { TaskRunner } from '../ports';
import type { EnsurePullRequest } from '../pull-request/ensure-pull-request';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface OnTicketEnteredInput {
  ticket: Ticket;
  handoff?: string;
  note?: string;
}

export type OnTicketEnteredOutput = Record<string, never>;

/**
 * チケットが新しい状態に入ったとき(起票でも、遷移でも)の後始末。
 * エージェントのいる状態なら、起動する。いない状態なら、終了する。完了前ゲートなら PR を作る。完了なら、ワークツリーを消して作業を元のリポジトリへ反映し、依存していたものを動かす。
 */
export class OnTicketEntered implements UseCase<OnTicketEnteredInput, OnTicketEnteredOutput> {
  constructor(
    private readonly tasks: TaskRunner,
    private readonly launchAgent: LaunchAgent,
    private readonly endAgents: EndAgents,
    private readonly ensurePullRequest: EnsurePullRequest,
    private readonly cleanUpWorktrees: CleanUpWorktrees,
    private readonly notifyDependents: NotifyDependents,
  ) {}

  async execute(ctx: RequestContext, input: OnTicketEnteredInput): Promise<OnTicketEnteredOutput> {
    const { ticket } = input;
    if (ticket.hasAgent) {
      await this.launchAgent.execute(ctx, { ticket, handoff: input.handoff, note: input.note });
    } else {
      await this.endAgents.execute(ctx, { ticketId: ticket.id });
    }
    if (ticket.state === State.PRE_DONE_GATE) {
      this.tasks.run(ctx, this.ensurePullRequest.execute(ctx, { ticketId: ticket.id }));
    }
    if (ticket.state === State.DONE) {
      await this.cleanUpWorktrees.execute(ctx, { ticket });
      await this.notifyDependents.execute(ctx, { ticket });
    }
    return {};
  }
}
