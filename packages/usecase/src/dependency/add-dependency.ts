import { AnvilError } from '@anvil/entity';
import type { FindTicket } from '../find/find-ticket';
import type { DependencyStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface AddDependencyInput {
  /** 着手を待たされる側 */
  ticketId: number;
  /** 完了を待たれる側 */
  dependsOnId: number;
}

export type AddDependencyOutput = Record<string, never>;

/** 依存を足す。自分自身と、循環は不可。 */
export class AddDependency implements UseCase<AddDependencyInput, AddDependencyOutput> {
  constructor(
    private readonly dependencies: DependencyStore,
    private readonly findTicket: FindTicket,
  ) {}

  async execute(ctx: RequestContext, input: AddDependencyInput): Promise<AddDependencyOutput> {
    await this.findTicket.execute(ctx, { ticketId: input.ticketId });
    await this.findTicket.execute(ctx, { ticketId: input.dependsOnId });
    if (input.ticketId === input.dependsOnId) throw AnvilError.invalid('自分自身には依存できない');
    if (await this.reaches(ctx, input.dependsOnId, input.ticketId, new Set())) throw AnvilError.invalid('依存が循環する');
    await this.dependencies.add(ctx, input.ticketId, input.dependsOnId);
    return {};
  }

  /** from から、依存をたどって、target に着くか */
  private async reaches(ctx: RequestContext, from: number, target: number, seen: Set<number>): Promise<boolean> {
    if (from === target) return true;
    if (seen.has(from)) return false;
    seen.add(from);
    for (const next of await this.dependencies.dependsOn(ctx, from)) {
      if (await this.reaches(ctx, next, target, seen)) return true;
    }
    return false;
  }
}
