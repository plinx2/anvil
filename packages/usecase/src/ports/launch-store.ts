import type { Launch, NewOf } from '@anvil/entity';
import type { RequestContext } from '../request-context';

export interface LaunchStore {
  add(ctx: RequestContext, launch: NewOf<Launch>): Promise<Launch>;
  listByTicket(ctx: RequestContext, ticketId: number): Promise<Launch[]>;
  /** 終了していない起動 */
  activeByTicket(ctx: RequestContext, ticketId: number): Promise<Launch[]>;
  activeByIntakeItem(ctx: RequestContext, intakeItemId: number): Promise<Launch[]>;
  end(ctx: RequestContext, id: number, at: string): Promise<void>;
  /** 起動に失敗した記録を消す(存在しないセッションを、あとで再開しようとしないため) */
  delete(ctx: RequestContext, id: number): Promise<void>;
  /** チケット未定で起動した起票エージェントを、起票後にチケットへ紐づける */
  attachTicket(ctx: RequestContext, intakeItemId: number, ticketId: number): Promise<void>;
  deleteByTicket(ctx: RequestContext, ticketId: number): Promise<void>;
  deleteByIntakeItem(ctx: RequestContext, intakeItemId: number): Promise<void>;
}
