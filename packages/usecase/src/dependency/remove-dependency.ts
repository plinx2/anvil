import type { DependencyStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface RemoveDependencyInput {
  ticketId: number;
  dependsOnId: number;
}

export type RemoveDependencyOutput = Record<string, never>;

export class RemoveDependency implements UseCase<RemoveDependencyInput, RemoveDependencyOutput> {
  constructor(private readonly dependencies: DependencyStore) {}

  async execute(ctx: RequestContext, input: RemoveDependencyInput): Promise<RemoveDependencyOutput> {
    await this.dependencies.remove(ctx, input.ticketId, input.dependsOnId);
    return {};
  }
}
