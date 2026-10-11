import type { Ticket } from '@anvil/entity';
import type { FindProject } from '../find/find-project';
import type { AgentConfigWriter, AgentRuntime, Clock, IdGenerator, LaunchStore, TicketStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';
import type { BuildAgentPrompt } from './build-agent-prompt';
import type { EndAgents } from './end-agents';
import type { ResolveWorkdir } from './resolve-workdir';

export interface LaunchAgentInput {
  ticket: Ticket;
  handoff?: string;
  note?: string;
  /** 同じ状態の途中なら、前のセッションを再開する */
  resume?: boolean;
}

export type LaunchAgentOutput = Record<string, never>;

/**
 * 今の状態の担当エージェントを起動する。起動できてから、前のエージェントを終了する。
 * 失敗しても例外にせず、チケットに起動の失敗を残す(前のエージェントは、残る)。
 */
export class LaunchAgent implements UseCase<LaunchAgentInput, LaunchAgentOutput> {
  constructor(
    private readonly tickets: TicketStore,
    private readonly launches: LaunchStore,
    private readonly agents: AgentRuntime,
    private readonly agentConfig: AgentConfigWriter,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
    private readonly findProject: FindProject,
    private readonly buildAgentPrompt: BuildAgentPrompt,
    private readonly resolveWorkdir: ResolveWorkdir,
    private readonly endAgents: EndAgents,
  ) {}

  async execute(ctx: RequestContext, input: LaunchAgentInput): Promise<LaunchAgentOutput> {
    const { ticket } = input;
    const role = ticket.state.role;
    if (!role) return {};

    const { project } = await this.findProject.execute(ctx, { projectId: ticket.projectId });
    const name = `anvil_t${ticket.id}_${role.id}`;
    const previous = input.resume
      ? (await this.launches.listByTicket(ctx, ticket.id)).filter((l) => l.state === ticket.state && l.role === role).at(-1)
      : undefined;
    const sessionId = previous?.sessionId ?? this.ids.uuid(ctx);
    const { prompt, addDirs } = await this.buildAgentPrompt.execute(ctx, { ticket, role, handoff: input.handoff, note: input.note });

    const launch = await this.launches.add(ctx, {
      ticketId: ticket.id,
      intakeItemId: null,
      state: ticket.state,
      role,
      name,
      sessionId,
      startedAt: this.clock.now(ctx),
      endedAt: null,
    });
    try {
      const mcpConfigPath = await this.agentConfig.write(ctx, { fileName: `t${ticket.id}-${role.id}.json`, ticketId: ticket.id, role });
      const { workdir } = await this.resolveWorkdir.execute(ctx, { ticket });
      await this.agents.launch(ctx, {
        name,
        project: project.name,
        label: `T-${ticket.id}`,
        role,
        modelTier: role.modelTier,
        cwd: workdir,
        prompt,
        addDirs,
        session: { id: sessionId, resume: previous !== undefined },
        mcpConfigPath,
      });
      await this.endAgents.execute(ctx, { ticketId: ticket.id, exceptLaunchId: launch.id });
    } catch (e) {
      await this.launches.delete(ctx, launch.id);
      const latest = await this.tickets.get(ctx, ticket.id);
      if (latest) await this.tickets.save(ctx, latest.withLaunchError(`起動に失敗した: ${(e as Error).message}`));
    }
    return {};
  }
}
