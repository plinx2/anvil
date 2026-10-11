import { AnvilError, type Project } from '@anvil/entity';
import type { Clock, ContextStore, ProjectStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface CreateProjectInput {
  name: string;
}

export interface CreateProjectOutput {
  project: Project;
}

/** プロジェクトの登録。プロジェクトコンテキストの置き場(入口のページ)も作る。 */
export class CreateProject implements UseCase<CreateProjectInput, CreateProjectOutput> {
  constructor(
    private readonly projects: ProjectStore,
    private readonly context: ContextStore,
    private readonly clock: Clock,
  ) {}

  async execute(ctx: RequestContext, input: CreateProjectInput): Promise<CreateProjectOutput> {
    const name = input.name.trim();
    if (!name) throw AnvilError.invalid('名前が空');
    if (await this.projects.getByName(ctx, name)) throw AnvilError.conflict('同名のプロジェクトがある');
    const project = await this.projects.create(ctx, name, this.clock.now(ctx));
    await this.context.ensure(ctx, project.name);
    return { project };
  }
}
