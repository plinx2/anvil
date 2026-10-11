import type { RequestContext } from '../request-context';

/** 作業場所の置き方。 */
export interface Workspace {
  /** チケットのワークツリーの親(複数のリポジトリを並べる) */
  worktreeRoot(ctx: RequestContext, projectName: string, slug: string): string;
  repoWorktree(ctx: RequestContext, projectName: string, slug: string, repoName: string): string;
  /** プロジェクトの作業場所を、すべて消す(コンテキストとワークツリーの置き場。リポジトリそのものには触れない) */
  removeProjectDir(ctx: RequestContext, projectName: string): Promise<void>;
  /** どのリポジトリも無いときの作業場所 */
  homeDir(ctx: RequestContext): string;
}
