import type { Role } from '@anvil/entity';
import type { RequestContext } from '../request-context';

export interface ContextPage {
  readonly path: string;
  readonly content: string;
}

/** プロジェクトコンテキスト(プロジェクトごとの知識。共通と、ロール別)。 */
export interface ContextStore {
  ensure(ctx: RequestContext, projectName: string): Promise<void>;
  pages(ctx: RequestContext, projectName: string): Promise<ContextPage[]>;
  /** プロジェクトコンテキストのディレクトリ。エージェントが作業ディレクトリの外から読めるように、起動時に許可する */
  dirPath(ctx: RequestContext, projectName: string): string;
  indexPath(ctx: RequestContext, projectName: string): string;
  rolePagePath(ctx: RequestContext, projectName: string, role: Role): string;
}
