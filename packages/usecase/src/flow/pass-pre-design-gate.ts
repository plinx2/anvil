import { AnvilError, State, type Ticket } from '@anvil/entity';
import type { CutBranches } from '../branch/cut-branches';
import type { FindTicket } from '../find/find-ticket';
import type { Clock, TicketStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';
import type { TransitionTicket } from './transition-ticket';

export interface PassPreDesignGateInput {
  ticketId: number;
  /** ストーリーポイント(人間が、実装方針を見て、ポーカーで決める) */
  sp: number;
}

export interface PassPreDesignGateOutput {
  ticket: Ticket;
}

/** 設計前ゲートの突破。人間だけ。SP が必須。対象リポジトリに、ブランチとワークツリーを切る。 */
export class PassPreDesignGate implements UseCase<PassPreDesignGateInput, PassPreDesignGateOutput> {
  constructor(
    private readonly tickets: TicketStore,
    private readonly clock: Clock,
    private readonly findTicket: FindTicket,
    private readonly cutBranches: CutBranches,
    private readonly transitionTicket: TransitionTicket,
  ) {}

  async execute(ctx: RequestContext, input: PassPreDesignGateInput): Promise<PassPreDesignGateOutput> {
    const { ticket } = await this.findTicket.execute(ctx, { ticketId: input.ticketId });
    if (ticket.state !== State.PRE_DESIGN_GATE) throw AnvilError.conflict('設計前ゲートではない');
    if (!ctx.actor.isHuman) throw AnvilError.forbidden('設計前ゲートは、人間だけが突破できる');
    if (!(input.sp > 0)) throw AnvilError.invalid('SP の入力が必須');
    if (ticket.targetRepos.length === 0) throw AnvilError.blocked('対象リポジトリが未設定のため、突破できない');

    await this.cutBranches.execute(ctx, { ticket });
    const withSp = ticket.withSp(input.sp, this.clock.now(ctx));
    await this.tickets.save(ctx, withSp);
    return this.transitionTicket.execute(ctx, { ticketId: ticket.id, to: withSp.nextState() });
  }
}
