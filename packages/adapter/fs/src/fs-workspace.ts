import fs from 'node:fs';
import path from 'node:path';
import type { RequestContext, Workspace } from '@anvil/usecase';

/** ワークツリーの置き場: <home>/<プロジェクト>/worktrees/<slug>/<リポジトリ名>/ */
export class FsWorkspace implements Workspace {
  constructor(private readonly home: string) {}

  worktreeRoot(_ctx: RequestContext, projectName: string, slug: string): string {
    return path.join(this.home, projectName, 'worktrees', slug);
  }

  repoWorktree(ctx: RequestContext, projectName: string, slug: string, repoName: string): string {
    return path.join(this.worktreeRoot(ctx, projectName, slug), repoName);
  }

  async removeProjectDir(_ctx: RequestContext, projectName: string): Promise<void> {
    fs.rmSync(path.join(this.home, projectName), { recursive: true, force: true });
  }

  homeDir(_ctx: RequestContext): string {
    return this.home;
  }
}
