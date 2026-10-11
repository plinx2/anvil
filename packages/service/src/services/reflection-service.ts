import { AnvilError, State } from '@anvil/entity';
import type { DecideReflection, ListReflections, RequestContext, SaveReflection } from '@anvil/usecase';
import { type DecideReflectionInput, DecideReflectionInputSchema } from '../input/decide-reflection-input';
import { type ListReflectionsInput, ListReflectionsInputSchema } from '../input/list-reflections-input';
import { type SaveReflectionInput, SaveReflectionInputSchema } from '../input/save-reflection-input';
import { type DecideReflectionOutput, toDecideReflectionOutput } from '../output/decide-reflection-output';
import { type ListReflectionsOutput, toListReflectionsOutput } from '../output/list-reflections-output';
import { type SaveReflectionOutput, toSaveReflectionOutput } from '../output/save-reflection-output';

/** 振り返り(作業完了時の保存と、オーナーによる採否)。 */
export class ReflectionService {
  constructor(
    private readonly saveReflection: SaveReflection,
    private readonly listReflections: ListReflections,
    private readonly decideReflection: DecideReflection,
  ) {}

  /** 振り返りの保存。ロールのエージェントだけ(書き手のロールが、振り返りのロールになる)。 */
  async save(ctx: RequestContext, input: SaveReflectionInput): Promise<SaveReflectionOutput> {
    const role = ctx.actor.role;
    if (!role) throw AnvilError.forbidden('振り返りを保存できるのは、ロールのエージェントだけ');
    const i = SaveReflectionInputSchema.parse(input);
    return toSaveReflectionOutput(await this.saveReflection.execute(ctx, { ...i, role, state: i.state ? State.of(i.state) : undefined }));
  }

  /** 振り返りの一覧(改善の対象、ロール、採否で絞れる)。 */
  async list(ctx: RequestContext, input: ListReflectionsInput): Promise<ListReflectionsOutput> {
    return toListReflectionsOutput(await this.listReflections.execute(ctx, ListReflectionsInputSchema.parse(input)));
  }

  /** 採否(未判断 / 採用 / 却下)。 */
  async decide(ctx: RequestContext, input: DecideReflectionInput): Promise<DecideReflectionOutput> {
    return toDecideReflectionOutput(await this.decideReflection.execute(ctx, DecideReflectionInputSchema.parse(input)));
  }
}
