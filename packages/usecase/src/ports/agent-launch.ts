import type { ModelTier, Role } from '@anvil/entity';

/**
 * エージェントの起動の依頼。特定のエージェント製品の概念を含まない
 * (モデルの名前、起動の引数、設定の形式への対応は、各エージェントの実装が持つ)。
 */
export interface AgentLaunch {
  /** 実行環境(herdr)上の名前。anvil が付ける(チケット+ロール)。送り先は、この名前だけ */
  readonly name: string;
  readonly project: string;
  /** タブの表示名 */
  readonly label: string;
  readonly role: Role;
  readonly modelTier: ModelTier;
  readonly cwd: string;
  /** 最初に渡す入力 */
  readonly prompt: string;
  /** anvil が決めるセッションの識別子(起動の記録に必ず残る)。resume なら、前のセッションを再開する */
  readonly session: { readonly id: string; readonly resume: boolean };
  /** 作業ディレクトリの外で、エージェントが読んでよい場所(プロジェクトコンテキスト)。許可の確認で止まらないように渡す */
  readonly addDirs: readonly string[];
  /** エージェントに渡す、anvil の MCP の設定ファイル */
  readonly mcpConfigPath: string;
}
