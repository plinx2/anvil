import path from 'node:path';
import { ClaudeCliPullRequestBodyWriter, ClaudeMcpConfigWriter } from '@anvil/claude-cli';
import { FsContextStore, FsRoleDefinitions, FsWorkspace } from '@anvil/fs';
import { GhCliPullRequests } from '@anvil/gh-cli';
import { GitCli } from '@anvil/git-cli';
import { HerdrClaudeCli, HerdrCli, HerdrNotifier } from '@anvil/herdr-claude-cli';
import { NoopAgentConfigWriter, NoopAgentRuntime, NoopPullRequest, RecordingNotifier } from '@anvil/noop';
import {
  SqliteBranchStore,
  SqliteDatabase,
  SqliteDependencyStore,
  SqliteEntryStore,
  SqliteHistoryStore,
  SqliteIntakeStore,
  SqliteLaunchStore,
  SqliteProjectStore,
  SqliteReflectionStore,
  SqliteRepoStore,
  SqliteTicketStore,
  SqliteTransactor,
} from '@anvil/sqlite';
import { CryptoIdGenerator, InProcessTaskRunner, SystemClock } from '@anvil/system';
import type { AnvilConfig } from './anvil-config';
import type { AnvilPorts } from './anvil-ports';

/** 何もしない実装を選んだときの、記録(テストで確かめる)。 */
export interface AnvilFakes {
  agents?: NoopAgentRuntime;
  notifier?: RecordingNotifier;
  pullRequests?: NoopPullRequest;
}

export interface CreatedPorts {
  ports: AnvilPorts;
  tasks: InProcessTaskRunner;
  fakes: AnvilFakes;
}

/** 設定に従って、ports の実装を選んで、つなぐ。 */
export function createPorts(config: AnvilConfig): CreatedPorts {
  const database = new SqliteDatabase(config.dbFile ?? path.join(config.home, 'anvil.db'));
  const tasks = new InProcessTaskRunner();
  const fakes: AnvilFakes = {};

  // エージェントの種類(anvil の起動時に選ぶ)
  let agents: AnvilPorts['agents'];
  let agentConfig: AnvilPorts['agentConfig'];
  let notifier: AnvilPorts['notifier'];
  if (config.agent === 'herdr-claude-cli') {
    const herdr = new HerdrCli(config.herdrSession);
    agents = new HerdrClaudeCli(config.models, herdr, config.home);
    agentConfig = new ClaudeMcpConfigWriter(config.home, config.mcpUrl);
    notifier = new HerdrNotifier(herdr);
  } else {
    fakes.agents = new NoopAgentRuntime();
    fakes.notifier = new RecordingNotifier();
    agents = fakes.agents;
    agentConfig = new NoopAgentConfigWriter();
    notifier = fakes.notifier;
  }

  // PR の作り方
  let pullRequests: AnvilPorts['pullRequests'];
  if (config.pullRequests === 'gh-cli') {
    pullRequests = new GhCliPullRequests(new ClaudeCliPullRequestBodyWriter(config.models));
  } else {
    fakes.pullRequests = new NoopPullRequest();
    pullRequests = fakes.pullRequests;
  }

  const ports: AnvilPorts = {
    projects: new SqliteProjectStore(database),
    repos: new SqliteRepoStore(database),
    tickets: new SqliteTicketStore(database),
    entries: new SqliteEntryStore(database),
    dependencies: new SqliteDependencyStore(database),
    launches: new SqliteLaunchStore(database),
    history: new SqliteHistoryStore(database),
    reflections: new SqliteReflectionStore(database),
    intakes: new SqliteIntakeStore(database),
    branches: new SqliteBranchStore(database),
    transactor: new SqliteTransactor(database),
    agents,
    agentConfig,
    notifier,
    git: new GitCli(),
    pullRequests,
    context: new FsContextStore(config.home),
    workspace: new FsWorkspace(config.home),
    roleDefinitions: new FsRoleDefinitions(config.agentsDir),
    clock: new SystemClock(),
    ids: new CryptoIdGenerator(),
    tasks,
  };
  return { ports, tasks, fakes };
}
