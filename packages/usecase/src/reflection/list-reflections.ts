import type { Reflection } from '@anvil/entity';
import type { ReflectionFilter, ReflectionStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export type ListReflectionsInput = ReflectionFilter;

export interface ListReflectionsOutput {
  reflections: Reflection[];
}

/** 振り返りの一覧(改善の対象とロールで、絞り込める)。同じ指摘をまとめる仕組みは、持たない。 */
export class ListReflections implements UseCase<ListReflectionsInput, ListReflectionsOutput> {
  constructor(private readonly reflections: ReflectionStore) {}

  async execute(ctx: RequestContext, input: ListReflectionsInput): Promise<ListReflectionsOutput> {
    return { reflections: await this.reflections.list(ctx, input) };
  }
}
