import type { Reflection, ReflectionTarget, Role, State } from '@anvil/entity';
import type { FindTicket } from '../find/find-ticket';
import type { Clock, LaunchStore, ReflectionStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface SaveReflectionInput {
  ticketId?: number;
  role: Role;
  state?: State;
  good?: string;
  trouble?: string;
  hypothesis?: string;
  proposal?: string;
  target?: ReflectionTarget;
  evidence?: string;
}

export interface SaveReflectionOutput {
  reflection: Reflection;
}

/** 作業完了時の振り返りを保存する。チケット、ロール、状態、セッション ID に紐づく。強制はしない(無くても、次へ進める)。 */
export class SaveReflection implements UseCase<SaveReflectionInput, SaveReflectionOutput> {
  constructor(
    private readonly reflections: ReflectionStore,
    private readonly launches: LaunchStore,
    private readonly clock: Clock,
    private readonly findTicket: FindTicket,
  ) {}

  async execute(ctx: RequestContext, input: SaveReflectionInput): Promise<SaveReflectionOutput> {
    const ticket = input.ticketId ? (await this.findTicket.execute(ctx, { ticketId: input.ticketId })).ticket : null;
    const launches = ticket ? await this.launches.listByTicket(ctx, ticket.id) : [];
    const sessionId = launches.filter((l) => l.role === input.role).at(-1)?.sessionId ?? null;

    const reflection = await this.reflections.add(ctx, {
      ticketId: ticket?.id ?? null,
      role: input.role,
      state: input.state ?? ticket?.state ?? null,
      sessionId,
      good: input.good ?? '',
      trouble: input.trouble ?? '',
      hypothesis: input.hypothesis ?? '',
      proposal: input.proposal ?? '',
      target: input.target ?? 'role',
      evidence: input.evidence ?? '',
      status: 'pending',
      rejectReason: null,
      createdAt: this.clock.now(ctx),
      decidedAt: null,
    });
    return { reflection };
  }
}
