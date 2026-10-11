import { AnvilError, type Repo } from '@anvil/entity';
import type { FindProject } from '../find/find-project';
import type { Clock, ProjectStore, RepoStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface AddRepoInput {
  projectId: number;
  name: string;
  path: string;
  defaultBranch?: string;
  hasRemote?: boolean;
}

export interface AddRepoOutput {
  repos: Repo[];
}

/** リポジトリの登録。1 つのリポジトリは、1 つのプロジェクトにだけ属する(共有の需要が出るまで)。 */
export class AddRepo implements UseCase<AddRepoInput, AddRepoOutput> {
  constructor(
    private readonly repos: RepoStore,
    private readonly projects: ProjectStore,
    private readonly clock: Clock,
    private readonly findProject: FindProject,
  ) {}

  async execute(ctx: RequestContext, input: AddRepoInput): Promise<AddRepoOutput> {
    await this.findProject.execute(ctx, { projectId: input.projectId });
    if (await this.repos.findByPath(ctx, input.path)) throw AnvilError.conflict('このパスのリポジトリは、既にプロジェクトに属している');
    await this.repos.add(ctx, {
      projectId: input.projectId,
      name: input.name,
      path: input.path,
      defaultBranch: input.defaultBranch ?? 'main',
      hasRemote: input.hasRemote ?? false,
    });
    await this.projects.touch(ctx, input.projectId, this.clock.now(ctx));
    return { repos: await this.repos.listByProject(ctx, input.projectId) };
  }
}
