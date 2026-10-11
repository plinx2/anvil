import { AnvilError, type Intake, type IntakeItem } from '@anvil/entity';
import type { IntakeStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface GetIntakeInput {
  intakeId: number;
}

export interface GetIntakeOutput {
  intake: Intake;
  items: IntakeItem[];
}

export class GetIntake implements UseCase<GetIntakeInput, GetIntakeOutput> {
  constructor(private readonly intakes: IntakeStore) {}

  async execute(ctx: RequestContext, input: GetIntakeInput): Promise<GetIntakeOutput> {
    const intake = await this.intakes.get(ctx, input.intakeId);
    if (!intake) throw AnvilError.notFound(`起票の依頼が無い: ${input.intakeId}`);
    return { intake, items: await this.intakes.items(ctx, intake.id) };
  }
}
