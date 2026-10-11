import { AnvilError, type Project } from '@anvil/entity';
import type { ProjectStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

export interface FindProjectInput {
  projectId: number;
}

export interface FindProjectOutput {
  project: Project;
}

/** プロジェクトを探す。無ければ、見つからないエラー。 */
export class FindProject implements UseCase<FindProjectInput, FindProjectOutput> {
  constructor(private readonly projects: ProjectStore) {}

  async execute(ctx: RequestContext, input: FindProjectInput): Promise<FindProjectOutput> {
    const project = await this.projects.get(ctx, input.projectId);
    if (!project) throw AnvilError.notFound(`プロジェクトが無い: ${input.projectId}`);
    return { project };
  }
}
