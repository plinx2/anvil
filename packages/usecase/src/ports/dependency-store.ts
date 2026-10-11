import type { RequestContext } from '../request-context';

/** チケット間の依存(A が完了するまで、B は着手できない)。 */
export interface DependencyStore {
  add(ctx: RequestContext, ticketId: number, dependsOnId: number): Promise<void>;
  remove(ctx: RequestContext, ticketId: number, dependsOnId: number): Promise<void>;
  /** ticketId が依存している先 */
  dependsOn(ctx: RequestContext, ticketId: number): Promise<number[]>;
  /** ticketId に依存しているもの */
  dependents(ctx: RequestContext, ticketId: number): Promise<number[]>;
  /** このチケットが関わる依存(両方向)を、すべて消す */
  deleteByTicket(ctx: RequestContext, ticketId: number): Promise<void>;
}
