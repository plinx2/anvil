import { AnvilError, type Reflection, type ReflectionStatus } from '@anvil/entity';
import type { Clock, ReflectionStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface DecideReflectionInput {
  reflectionId: number;
  status: ReflectionStatus;
  /** 却下の理由(任意) */
  reason?: string;
}

export interface DecideReflectionOutput {
  reflection: Reflection;
}

/** 振り返りの採否(未判断 / 採用 / 却下)。採用しても、anvil は反映しない(オーナーが自分で書く、または Claude に書かせる)。 */
export class DecideReflection implements UseCase<DecideReflectionInput, DecideReflectionOutput> {
  constructor(
    private readonly reflections: ReflectionStore,
    private readonly clock: Clock,
  ) {}

  async execute(ctx: RequestContext, input: DecideReflectionInput): Promise<DecideReflectionOutput> {
    const reflection = await this.reflections.get(ctx, input.reflectionId);
    if (!reflection) throw AnvilError.notFound('振り返りが無い');
    const decided: Reflection = { ...reflection, status: input.status, rejectReason: input.reason ?? null, decidedAt: this.clock.now(ctx) };
    await this.reflections.save(ctx, decided);
    return { reflection: decided };
  }
}
