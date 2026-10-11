import { AnvilError, type Repo } from '@anvil/entity';
import type { FindProject } from '../find/find-project';
import type { Clock, ProjectStore, RepoStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface UpdateRepoInput {
  projectId: number;
  /** 対象のリポジトリの名前。変更後の名前ではない(名前は変えられない) */
  name: string;
  defaultBranch?: string;
  hasRemote?: boolean;
  path?: string;
}

export interface UpdateRepoOutput {
  repos: Repo[];
}

/** 登録済みリポジトリの更新。指定した項目(undefined でないもの)だけを書き換える。検証をすべて通ってから、1 回だけ書く。 */
export class UpdateRepo implements UseCase<UpdateRepoInput, UpdateRepoOutput> {
  constructor(
    private readonly repos: RepoStore,
    private readonly projects: ProjectStore,
    private readonly clock: Clock,
    private readonly findProject: FindProject,
  ) {}

  async execute(ctx: RequestContext, input: UpdateRepoInput): Promise<UpdateRepoOutput> {
    if (input.defaultBranch === undefined && input.hasRemote === undefined && input.path === undefined) {
      throw AnvilError.invalid('更新する項目を 1 つ以上指定する(hasRemote、defaultBranch、path)');
    }

    await this.findProject.execute(ctx, { projectId: input.projectId });

    const current = (await this.repos.listByProject(ctx, input.projectId)).find((r) => r.name === input.name);
    if (!current) throw AnvilError.notFound(`リポジトリが無い: ${input.name}(プロジェクト ${input.projectId})`);

    if (input.path !== undefined) {
      const owner = await this.repos.findByPath(ctx, input.path);
      if (owner && owner.id !== current.id) throw AnvilError.conflict('このパスのリポジトリは、既にプロジェクトに属している');
    }

    await this.repos.update(ctx, current.id, {
      defaultBranch: input.defaultBranch ?? current.defaultBranch,
      hasRemote: input.hasRemote ?? current.hasRemote,
      path: input.path ?? current.path,
    });
    await this.projects.touch(ctx, input.projectId, this.clock.now(ctx));
    return { repos: await this.repos.listByProject(ctx, input.projectId) };
  }
}
