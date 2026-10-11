import type { AddRepo, CreateProject, DeleteProject, GetContextPages, ListProjects, RequestContext } from '@anvil/usecase';
import { type AddRepoInput, AddRepoInputSchema } from '../input/add-repo-input';
import { type CreateProjectInput, CreateProjectInputSchema } from '../input/create-project-input';
import { type DeleteProjectInput, DeleteProjectInputSchema } from '../input/delete-project-input';
import { type GetContextPagesInput, GetContextPagesInputSchema } from '../input/get-context-pages-input';
import { type ListProjectsInput, ListProjectsInputSchema } from '../input/list-projects-input';
import { type AddRepoOutput, toAddRepoOutput } from '../output/add-repo-output';
import { type CreateProjectOutput, toCreateProjectOutput } from '../output/create-project-output';
import { type DeleteProjectOutput, toDeleteProjectOutput } from '../output/delete-project-output';
import { type GetContextPagesOutput, toGetContextPagesOutput } from '../output/get-context-pages-output';
import { type ListProjectsOutput, toListProjectsOutput } from '../output/list-projects-output';

/** プロジェクトとリポジトリの管理、プロジェクトコンテキストの閲覧。 */
export class ProjectService {
  constructor(
    private readonly createProject: CreateProject,
    private readonly deleteProjectOf: DeleteProject,
    private readonly addRepoTo: AddRepo,
    private readonly listProjects: ListProjects,
    private readonly getContextPages: GetContextPages,
  ) {}

  async create(ctx: RequestContext, input: CreateProjectInput): Promise<CreateProjectOutput> {
    return toCreateProjectOutput(await this.createProject.execute(ctx, CreateProjectInputSchema.parse(input)));
  }

  /**
   * プロジェクトの削除。チケット、起票の依頼、リポジトリの登録、エージェント、ワークツリー、プロジェクトコンテキストなど、関わるデータをすべて消す。
   * リポジトリそのものと、ブランチは残す。取り違えを防ぐため、名前をそのまま書く(confirmName)。
   */
  async delete(ctx: RequestContext, input: DeleteProjectInput): Promise<DeleteProjectOutput> {
    return toDeleteProjectOutput(await this.deleteProjectOf.execute(ctx, DeleteProjectInputSchema.parse(input)));
  }

  /** リポジトリの登録。登録後の、プロジェクトのリポジトリ一覧を返す。 */
  async addRepo(ctx: RequestContext, input: AddRepoInput): Promise<AddRepoOutput> {
    return toAddRepoOutput(await this.addRepoTo.execute(ctx, AddRepoInputSchema.parse(input)));
  }

  /** プロジェクトの一覧(リポジトリ、チケットの数つき)。 */
  async list(ctx: RequestContext, input: ListProjectsInput): Promise<ListProjectsOutput> {
    return toListProjectsOutput(await this.listProjects.execute(ctx, ListProjectsInputSchema.parse(input)));
  }

  /** プロジェクトコンテキストのページ。 */
  async contextPages(ctx: RequestContext, input: GetContextPagesInput): Promise<GetContextPagesOutput> {
    return toGetContextPagesOutput(await this.getContextPages.execute(ctx, GetContextPagesInputSchema.parse(input)));
  }
}
