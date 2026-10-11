import type { Ticket } from '@anvil/entity';

/** 一覧や画面に見せる、チケットとその周辺の情報。 */
export interface TicketSummary {
  ticket: Ticket;
  projectName: string;
  /** 依存が解消した TODO(着手可) */
  ready: boolean;
  /** 未完了の依存先 */
  unmetDependencyIds: number[];
  /** 今の状態の担当エージェントが、稼働中か(起動の記録がある) */
  agentActive: boolean;
  lastEntryAt: string;
  entryCount: number;
  /** 差し戻された回数 */
  rollbackCount: number;
}
