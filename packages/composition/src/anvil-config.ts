import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type ClaudeModels, DEFAULT_CLAUDE_MODELS } from '@anvil/claude-cli';
import { anvilHome } from '@anvil/fs';
import { DEFAULT_HERDR_SESSION } from '@anvil/herdr-claude-cli';

/** エージェントの種類。anvil の起動時に選ぶだけ(チケット、ロール、プロジェクトの単位では選ばない)。 */
export type AgentKind = 'noop' | 'herdr-claude-cli';

/** PR の作り方 */
export type PullRequestKind = 'noop' | 'gh-cli';

export interface AnvilConfig {
  /** データ領域(DB、ワークツリー、プロジェクトコンテキスト、MCP の設定) */
  home: string;
  /** SQLite のファイル。':memory:' も可。既定は <home>/anvil.db */
  dbFile?: string;
  /** ai-dev-team の docs(ロールの定義がある) */
  agentsDir: string;
  /** エージェントが接続する、anvil の MCP の URL */
  mcpUrl: string;
  agent: AgentKind;
  /** herdr のセッション名(プロジェクトごとのワークスペースを、この 1 つにまとめる)。'default' は herdr の既定のセッション */
  herdrSession: string;
  pullRequests: PullRequestKind;
  /** モデルの段階ごとの、Claude のモデル名 */
  models: ClaudeModels;
}

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * エージェントのコンテキスト(`agents/`)の置き場。ソースから動かしても、ビルドした成果物(まとめた 1 ファイル)から動かしても見つかるように、
 * このファイルの場所から親をたどって、`agents/roles` があるところを探す。見つからなければ、環境変数 ANVIL_AGENTS_DIR が要る。
 */
function defaultAgentsDir(): string {
  for (let dir = here; ; dir = path.dirname(dir)) {
    const candidate = path.join(dir, 'agents');
    if (fs.existsSync(path.join(candidate, 'roles'))) return candidate;
    if (path.dirname(dir) === dir) return path.resolve(here, '..', '..', '..', 'agents');
  }
}

/** 環境変数から、設定を作る。エージェントの既定は herdr(Claude Code)。何もしない実装にするには、ANVIL_AGENT=noop。 */
export function anvilConfigFromEnv(env: NodeJS.ProcessEnv = process.env): AnvilConfig {
  return {
    home: anvilHome(env),
    agentsDir: env.ANVIL_AGENTS_DIR ?? defaultAgentsDir(),
    mcpUrl: env.ANVIL_MCP_URL ?? `http://127.0.0.1:${env.ANVIL_MCP_PORT ?? 4731}/mcp`,
    agent: env.ANVIL_AGENT === 'noop' ? 'noop' : 'herdr-claude-cli',
    herdrSession: env.ANVIL_HERDR_SESSION || DEFAULT_HERDR_SESSION,
    pullRequests: env.ANVIL_PULL_REQUESTS === 'gh-cli' ? 'gh-cli' : 'noop',
    models: DEFAULT_CLAUDE_MODELS,
  };
}
