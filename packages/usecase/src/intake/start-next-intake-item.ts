import { Role } from '@anvil/entity';
import type { FindProject } from '../find/find-project';
import type {
  AgentConfigWriter,
  AgentRuntime,
  Clock,
  IdGenerator,
  IntakeStore,
  LaunchStore,
  Notifier,
  RepoStore,
  TicketStore,
  Workspace,
} from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';
import type { BuildIntakePrompt } from './build-intake-prompt';
import type { FinalizeIntake } from './finalize-intake';

export interface StartNextIntakeItemInput {
  intakeId: number;
}

export type StartNextIntakeItemOutput = Record<string, never>;

/** 起票の依頼の、次の 1 件の PBI 起票担当を起動する。1 件ずつ順に(人間の質問が 1 つずつになり、ペインも増えない)。尽きたら、締める。 */
export class StartNextIntakeItem implements UseCase<StartNextIntakeItemInput, StartNextIntakeItemOutput> {
  constructor(
    private readonly intakes: IntakeStore,
    private readonly tickets: TicketStore,
    private readonly repos: RepoStore,
    private readonly launches: LaunchStore,
    private readonly agents: AgentRuntime,
    private readonly agentConfig: AgentConfigWriter,
    private readonly notifier: Notifier,
    private readonly workspace: Workspace,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
    private readonly findProject: FindProject,
    private readonly buildIntakePrompt: BuildIntakePrompt,
    private readonly finalizeIntake: FinalizeIntake,
  ) {}

  async execute(ctx: RequestContext, input: StartNextIntakeItemInput): Promise<StartNextIntakeItemOutput> {
    const intake = await this.intakes.get(ctx, input.intakeId);
    if (intake?.status !== 'open') return {};
    const item = (await this.intakes.items(ctx, intake.id)).find((i) => i.status === 'pending');
    if (!item) {
      await this.finalizeIntake.execute(ctx, { intakeId: intake.id });
      return {};
    }
    await this.intakes.saveItem(ctx, { ...item, status: 'running' });

    const { project } = await this.findProject.execute(ctx, { projectId: intake.projectId });
    const source = intake.sourceTicketId ? await this.tickets.get(ctx, intake.sourceTicketId) : null;
    const { prompt, addDirs } = await this.buildIntakePrompt.execute(ctx, { item, projectName: project.name, source });
    const name = `anvil_intake${intake.id}-${item.seq}_${Role.PBI_AUTHOR.id}`;
    const sessionId = this.ids.uuid(ctx);

    const launch = await this.launches.add(ctx, {
      ticketId: null,
      intakeItemId: item.id,
      state: null,
      role: Role.PBI_AUTHOR,
      name,
      sessionId,
      startedAt: this.clock.now(ctx),
      endedAt: null,
    });
    try {
      const mcpConfigPath = await this.agentConfig.write(ctx, {
        fileName: `intake${intake.id}-${item.seq}.json`,
        role: Role.PBI_AUTHOR,
        intakeItemId: item.id,
        projectId: project.id,
      });
      const repos = await this.repos.listByProject(ctx, project.id);
      await this.agents.launch(ctx, {
        name,
        project: project.name,
        label: `起票 ${intake.id}-${item.seq + 1}`,
        role: Role.PBI_AUTHOR,
        modelTier: Role.PBI_AUTHOR.modelTier,
        cwd: repos[0]?.path ?? this.workspace.homeDir(ctx),
        prompt,
        addDirs,
        session: { id: sessionId, resume: false },
        mcpConfigPath,
      });
    } catch (e) {
      await this.launches.end(ctx, launch.id, this.clock.now(ctx));
      await this.notifier.notify(ctx, `${Role.PBI_AUTHOR.label}の起動に失敗`, (e as Error).message);
    }
    return {};
  }
}
