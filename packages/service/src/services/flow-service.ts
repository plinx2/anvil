import { State } from '@anvil/entity';
import type {
  AdvanceTicket,
  FocusAgent,
  PassPreDesignGate,
  PassPreDoneGate,
  PassPreImplGate,
  RebuildPullRequest,
  RequestContext,
  RollbackTicket,
  StartAgent,
  StartTicket,
} from '@anvil/usecase';
import { type AdvanceTicketInput, AdvanceTicketInputSchema } from '../input/advance-ticket-input';
import { type FocusAgentInput, FocusAgentInputSchema } from '../input/focus-agent-input';
import { type PassPreDesignGateInput, PassPreDesignGateInputSchema } from '../input/pass-pre-design-gate-input';
import { type PassPreDoneGateInput, PassPreDoneGateInputSchema } from '../input/pass-pre-done-gate-input';
import { type PassPreImplGateInput, PassPreImplGateInputSchema } from '../input/pass-pre-impl-gate-input';
import { type RebuildPullRequestInput, RebuildPullRequestInputSchema } from '../input/rebuild-pull-request-input';
import { type RollbackTicketInput, RollbackTicketInputSchema } from '../input/rollback-ticket-input';
import { type StartAgentInput, StartAgentInputSchema } from '../input/start-agent-input';
import { type StartTicketInput, StartTicketInputSchema } from '../input/start-ticket-input';
import { type AdvanceTicketOutput, toAdvanceTicketOutput } from '../output/advance-ticket-output';
import { type FocusAgentOutput, toFocusAgentOutput } from '../output/focus-agent-output';
import { type PassPreDesignGateOutput, toPassPreDesignGateOutput } from '../output/pass-pre-design-gate-output';
import { type PassPreDoneGateOutput, toPassPreDoneGateOutput } from '../output/pass-pre-done-gate-output';
import { type PassPreImplGateOutput, toPassPreImplGateOutput } from '../output/pass-pre-impl-gate-output';
import { type RebuildPullRequestOutput, toRebuildPullRequestOutput } from '../output/rebuild-pull-request-output';
import { type RollbackTicketOutput, toRollbackTicketOutput } from '../output/rollback-ticket-output';
import { type StartAgentOutput, toStartAgentOutput } from '../output/start-agent-output';
import { type StartTicketOutput, toStartTicketOutput } from '../output/start-ticket-output';

/** チケットの状態の流れの操作(進める、差し戻し、ゲートの突破、着手)。 */
export class FlowService {
  constructor(
    private readonly startTicket: StartTicket,
    private readonly advanceTicket: AdvanceTicket,
    private readonly rollbackTicket: RollbackTicket,
    private readonly passPreDesignGate: PassPreDesignGate,
    private readonly passPreImplGate: PassPreImplGate,
    private readonly passPreDoneGate: PassPreDoneGate,
    private readonly startAgent: StartAgent,
    private readonly focusAgent: FocusAgent,
    private readonly rebuildPullRequest: RebuildPullRequest,
  ) {}

  /** TODO → リファイン。 */
  async start(ctx: RequestContext, input: StartTicketInput): Promise<StartTicketOutput> {
    return toStartTicketOutput(await this.startTicket.execute(ctx, StartTicketInputSchema.parse(input)));
  }

  /** 担当が、作業を終えて、次の状態へ進める。 */
  async advance(ctx: RequestContext, input: AdvanceTicketInput): Promise<AdvanceTicketOutput> {
    return toAdvanceTicketOutput(await this.advanceTicket.execute(ctx, AdvanceTicketInputSchema.parse(input)));
  }

  /** 差し戻し(理由は必須)。 */
  async rollback(ctx: RequestContext, input: RollbackTicketInput): Promise<RollbackTicketOutput> {
    const i = RollbackTicketInputSchema.parse(input);
    return toRollbackTicketOutput(await this.rollbackTicket.execute(ctx, { ...i, target: i.target ? State.of(i.target) : undefined }));
  }

  /** 設計前ゲートの突破(人間。SP が必須。ブランチを切る)。 */
  async passDesignGate(ctx: RequestContext, input: PassPreDesignGateInput): Promise<PassPreDesignGateOutput> {
    return toPassPreDesignGateOutput(await this.passPreDesignGate.execute(ctx, PassPreDesignGateInputSchema.parse(input)));
  }

  /** 実装前ゲートの突破(人間か、自動ゲート承認)。 */
  async passImplGate(ctx: RequestContext, input: PassPreImplGateInput): Promise<PassPreImplGateOutput> {
    return toPassPreImplGateOutput(await this.passPreImplGate.execute(ctx, PassPreImplGateInputSchema.parse(input)));
  }

  /** 完了前ゲートの突破(人間のみ)。 */
  async passDoneGate(ctx: RequestContext, input: PassPreDoneGateInput): Promise<PassPreDoneGateOutput> {
    return toPassPreDoneGateOutput(await this.passPreDoneGate.execute(ctx, PassPreDoneGateInputSchema.parse(input)));
  }

  /** 着手(動いていないエージェントを起動・再開する)。 */
  async startAgentOf(ctx: RequestContext, input: StartAgentInput): Promise<StartAgentOutput> {
    return toStartAgentOutput(await this.startAgent.execute(ctx, StartAgentInputSchema.parse(input)));
  }

  /** 該当のエージェントのペインを開く。 */
  async focusAgentOf(ctx: RequestContext, input: FocusAgentInput): Promise<FocusAgentOutput> {
    return toFocusAgentOutput(await this.focusAgent.execute(ctx, FocusAgentInputSchema.parse(input)));
  }

  /** PR を作り直す。 */
  async rebuildPr(ctx: RequestContext, input: RebuildPullRequestInput): Promise<RebuildPullRequestOutput> {
    return toRebuildPullRequestOutput(await this.rebuildPullRequest.execute(ctx, RebuildPullRequestInputSchema.parse(input)));
  }
}
