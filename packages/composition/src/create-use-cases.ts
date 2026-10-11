import {
  AddDependency,
  AddEntry,
  AddRepo,
  AdvanceTicket,
  AnswerQuestion,
  AskQuestion,
  BuildAgentPrompt,
  BuildIntakePrompt,
  CleanUpWorktrees,
  CompleteIntakeItem,
  ContinueIntake,
  CreateProject,
  CreateTicket,
  CutBranches,
  DecideReflection,
  DeleteProject,
  DiscardTicket,
  EndAgents,
  EnsureAgent,
  EnsurePullRequest,
  FinalizeIntake,
  FindProject,
  FindTicket,
  FocusAgent,
  GetBoard,
  GetContextPages,
  GetDashboard,
  GetIntake,
  GetTicketDetail,
  IsAgentAlive,
  LaunchAgent,
  ListDependencies,
  ListDependents,
  ListEntries,
  ListProjects,
  ListReflections,
  ListUnmetDependencies,
  NotifyDependents,
  OnTicketEntered,
  PassPreDesignGate,
  PassPreDoneGate,
  PassPreImplGate,
  RebuildPullRequest,
  RemoveDependency,
  RequestIntake,
  ResolveWorkdir,
  RollbackTicket,
  SaveReflection,
  SetAutoGate,
  StartAgent,
  StartNextIntakeItem,
  StartTicket,
  SummarizeTicket,
  TransitionTicket,
  UpdateRepo,
  UpdateTicket,
} from '@anvil/usecase';
import type { AnvilPorts } from './anvil-ports';

/** すべてのユースケース。依存される側から順に、作る。 */
export function createUseCases(p: AnvilPorts) {
  // ---------- 探す ----------
  const findTicket = new FindTicket(p.tickets);
  const findProject = new FindProject(p.projects);

  // ---------- 依存 ----------
  const listDependencies = new ListDependencies(p.dependencies, p.tickets);
  const listDependents = new ListDependents(p.dependencies, p.tickets);
  const listUnmetDependencies = new ListUnmetDependencies(listDependencies);
  const addDependency = new AddDependency(p.dependencies, findTicket);
  const removeDependency = new RemoveDependency(p.dependencies);

  // ---------- エージェントの起動と終了 ----------
  const isAgentAlive = new IsAgentAlive(p.launches, p.agents);
  const endAgents = new EndAgents(p.launches, p.agents, p.clock);
  const resolveWorkdir = new ResolveWorkdir(p.branches, p.repos, p.workspace, findProject);
  const buildAgentPrompt = new BuildAgentPrompt(p.entries, p.context, p.roleDefinitions, findProject);
  const launchAgent = new LaunchAgent(
    p.tickets,
    p.launches,
    p.agents,
    p.agentConfig,
    p.clock,
    p.ids,
    findProject,
    buildAgentPrompt,
    resolveWorkdir,
    endAgents,
  );
  const ensureAgent = new EnsureAgent(p.tickets, p.launches, p.agents, isAgentAlive, launchAgent, listUnmetDependencies);

  // ---------- ブランチ、PR、完了 ----------
  const cutBranches = new CutBranches(p.branches, p.repos, p.git, p.workspace, findProject);
  const cleanUpWorktrees = new CleanUpWorktrees(p.branches, p.repos, p.git, p.notifier);
  const ensurePullRequest = new EnsurePullRequest(p.tickets, p.repos, p.entries, p.pullRequests, findTicket);
  const notifyDependents = new NotifyDependents(p.notifier, listDependents, listUnmetDependencies, ensureAgent);

  // ---------- 状態の遷移 ----------
  const onTicketEntered = new OnTicketEntered(p.tasks, launchAgent, endAgents, ensurePullRequest, cleanUpWorktrees, notifyDependents);
  const transitionTicket = new TransitionTicket(p.tickets, p.history, p.projects, p.transactor, p.clock, findTicket, onTicketEntered);
  const passPreImplGate = new PassPreImplGate(findTicket, transitionTicket);
  const passPreDesignGate = new PassPreDesignGate(p.tickets, p.clock, findTicket, cutBranches, transitionTicket);
  const passPreDoneGate = new PassPreDoneGate(findTicket, transitionTicket);

  // ---------- チケット ----------
  const addEntry = new AddEntry(p.entries, p.tickets, p.projects, p.transactor, p.clock, findTicket);
  const discardTicket = new DiscardTicket(
    p.tickets,
    p.entries,
    p.history,
    p.launches,
    p.branches,
    p.dependencies,
    p.projects,
    p.notifier,
    p.transactor,
    p.clock,
    findTicket,
    endAgents,
  );

  // ---------- 起票の依頼 ----------
  const buildIntakePrompt = new BuildIntakePrompt(p.context, p.roleDefinitions);
  const finalizeIntake = new FinalizeIntake(p.intakes, addDependency, discardTicket, endAgents);
  const startNextIntakeItem = new StartNextIntakeItem(
    p.intakes,
    p.tickets,
    p.repos,
    p.launches,
    p.agents,
    p.agentConfig,
    p.notifier,
    p.workspace,
    p.clock,
    p.ids,
    findProject,
    buildIntakePrompt,
    finalizeIntake,
  );
  const completeIntakeItem = new CompleteIntakeItem(p.intakes, p.launches, addDependency);
  const continueIntake = new ContinueIntake(p.intakes, p.launches, p.agents, p.clock, startNextIntakeItem);
  const requestIntake = new RequestIntake(p.intakes, p.tasks, p.clock, findProject, findTicket, startNextIntakeItem);
  const getIntake = new GetIntake(p.intakes);

  const createTicket = new CreateTicket(
    p.projects,
    p.repos,
    p.tickets,
    p.history,
    p.transactor,
    p.tasks,
    p.clock,
    findProject,
    findTicket,
    addDependency,
    completeIntakeItem,
    continueIntake,
    onTicketEntered,
    passPreImplGate,
  );
  const updateTicket = new UpdateTicket(p.tickets, p.repos, p.branches, p.projects, p.clock, findTicket);
  const setAutoGate = new SetAutoGate(p.tickets, p.tasks, p.clock, findTicket, passPreImplGate);
  const listEntries = new ListEntries(p.entries, findTicket);

  // ---------- 状態の流れの操作 ----------
  const startTicket = new StartTicket(findTicket, listUnmetDependencies, transitionTicket);
  const advanceTicket = new AdvanceTicket(findTicket, listUnmetDependencies, addEntry, transitionTicket);
  const rollbackTicket = new RollbackTicket(findTicket, addEntry, transitionTicket);
  const startAgent = new StartAgent(p.tickets, p.launches, findTicket, listUnmetDependencies, isAgentAlive, launchAgent);
  const focusAgent = new FocusAgent(p.launches, p.agents);
  const rebuildPullRequest = new RebuildPullRequest(findTicket, ensurePullRequest);

  // ---------- 承認待ちフラグ ----------
  const askQuestion = new AskQuestion(p.tickets, p.notifier, p.clock, findTicket, addEntry);
  const answerQuestion = new AnswerQuestion(p.tickets, p.clock, findTicket, addEntry, ensureAgent);

  // ---------- 振り返り ----------
  const saveReflection = new SaveReflection(p.reflections, p.launches, p.clock, findTicket);
  const listReflections = new ListReflections(p.reflections);
  const decideReflection = new DecideReflection(p.reflections, p.clock);

  // ---------- プロジェクト ----------
  const createProject = new CreateProject(p.projects, p.context, p.clock);
  const deleteProject = new DeleteProject(
    p.projects,
    p.repos,
    p.tickets,
    p.entries,
    p.history,
    p.launches,
    p.branches,
    p.dependencies,
    p.reflections,
    p.intakes,
    p.agents,
    p.agentConfig,
    p.git,
    p.workspace,
    p.notifier,
    p.transactor,
    p.clock,
    findProject,
    endAgents,
  );
  const addRepo = new AddRepo(p.repos, p.projects, p.clock, findProject);
  const updateRepo = new UpdateRepo(p.repos, p.projects, p.clock, findProject);
  const listProjects = new ListProjects(p.projects, p.repos, p.tickets);
  const getContextPages = new GetContextPages(p.context, findProject);

  // ---------- 読み取り ----------
  const summarizeTicket = new SummarizeTicket(p.projects, p.entries, p.history, p.launches, listDependencies);
  const getBoard = new GetBoard(p.tickets, summarizeTicket);
  const getTicketDetail = new GetTicketDetail(
    p.entries,
    p.launches,
    p.history,
    p.branches,
    findTicket,
    listDependencies,
    listDependents,
    summarizeTicket,
  );
  const getDashboard = new GetDashboard(p.tickets, p.projects, p.reflections, p.clock, getBoard);

  return {
    addEntry,
    addRepo,
    updateRepo,
    addDependency,
    advanceTicket,
    answerQuestion,
    askQuestion,
    createProject,
    deleteProject,
    createTicket,
    decideReflection,
    discardTicket,
    focusAgent,
    getBoard,
    getContextPages,
    getDashboard,
    getIntake,
    getTicketDetail,
    listEntries,
    listProjects,
    listReflections,
    passPreDesignGate,
    passPreDoneGate,
    passPreImplGate,
    rebuildPullRequest,
    removeDependency,
    requestIntake,
    rollbackTicket,
    saveReflection,
    setAutoGate,
    startAgent,
    startTicket,
    updateTicket,
  };
}

export type AnvilUseCases = ReturnType<typeof createUseCases>;
