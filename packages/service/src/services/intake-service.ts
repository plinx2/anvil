import { Kind, State } from '@anvil/entity';
import type { GetIntake, RequestContext, RequestIntake } from '@anvil/usecase';
import { type GetIntakeInput, GetIntakeInputSchema } from '../input/get-intake-input';
import { type RequestIntakeInput, RequestIntakeInputSchema } from '../input/request-intake-input';
import { type GetIntakeOutput, toGetIntakeOutput } from '../output/get-intake-output';
import { type RequestIntakeOutput, toRequestIntakeOutput } from '../output/request-intake-output';

/** 起票の依頼(分割・スパイク共通)。 */
export class IntakeService {
  constructor(
    private readonly requestIntake: RequestIntake,
    private readonly getIntake: GetIntake,
  ) {}

  /** 起票の依頼。1 件ずつ順に、PBI 起票担当が起動する。 */
  async request(ctx: RequestContext, input: RequestIntakeInput): Promise<RequestIntakeOutput> {
    const i = RequestIntakeInputSchema.parse(input);
    return toRequestIntakeOutput(
      await this.requestIntake.execute(ctx, {
        ...i,
        items: i.items.map((item) => ({
          ...item,
          kind: item.kind ? Kind.of(item.kind) : undefined,
          startState: item.startState ? State.of(item.startState) : undefined,
        })),
      }),
    );
  }

  /** 起票の依頼の進み具合。 */
  async progress(ctx: RequestContext, input: GetIntakeInput): Promise<GetIntakeOutput> {
    return toGetIntakeOutput(await this.getIntake.execute(ctx, GetIntakeInputSchema.parse(input)));
  }
}
