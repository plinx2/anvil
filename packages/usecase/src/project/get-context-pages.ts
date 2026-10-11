import type { FindProject } from '../find/find-project';
import type { ContextPage, ContextStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface GetContextPagesInput {
  projectId: number;
}

export interface GetContextPagesOutput {
  pages: ContextPage[];
}

/** プロジェクトコンテキストのページ(閲覧。書くのはオーナー、または Claude への指示)。 */
export class GetContextPages implements UseCase<GetContextPagesInput, GetContextPagesOutput> {
  constructor(
    private readonly context: ContextStore,
    private readonly findProject: FindProject,
  ) {}

  async execute(ctx: RequestContext, input: GetContextPagesInput): Promise<GetContextPagesOutput> {
    const { project } = await this.findProject.execute(ctx, input);
    return { pages: await this.context.pages(ctx, project.name) };
  }
}
