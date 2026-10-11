import type {
  AgentConfigWriter,
  AgentRuntime,
  BranchStore,
  Clock,
  ContextStore,
  DependencyStore,
  EntryStore,
  GitPort,
  HistoryStore,
  IdGenerator,
  IntakeStore,
  LaunchStore,
  Notifier,
  ProjectStore,
  PullRequestPort,
  ReflectionStore,
  RepoStore,
  RoleDefinitions,
  TaskRunner,
  TicketStore,
  Transactor,
  Workspace,
} from '@anvil/usecase';

/** ユースケースが使う、すべての ports の実装。 */
export interface AnvilPorts {
  readonly projects: ProjectStore;
  readonly repos: RepoStore;
  readonly tickets: TicketStore;
  readonly entries: EntryStore;
  readonly dependencies: DependencyStore;
  readonly launches: LaunchStore;
  readonly history: HistoryStore;
  readonly reflections: ReflectionStore;
  readonly intakes: IntakeStore;
  readonly branches: BranchStore;
  readonly transactor: Transactor;
  readonly agents: AgentRuntime;
  readonly agentConfig: AgentConfigWriter;
  readonly notifier: Notifier;
  readonly git: GitPort;
  readonly pullRequests: PullRequestPort;
  readonly context: ContextStore;
  readonly workspace: Workspace;
  readonly roleDefinitions: RoleDefinitions;
  readonly clock: Clock;
  readonly ids: IdGenerator;
  readonly tasks: TaskRunner;
}
