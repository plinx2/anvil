import type { Project, State } from '@anvil/entity';

/** ダッシュボードに出す、チケットの要点 */
export interface DashboardTicket {
  id: number;
  title: string;
  project: string;
  state: State;
}

/** 完了したチケットの数と、同じ期間の 1 年前の数(昨対) */
export interface DoneCount {
  count: number;
  lastYear: number;
}

export interface Dashboard {
  /** 承認待ち(待ち時間の長い順) */
  awaiting: Array<DashboardTicket & { since: string }>;
  /** エージェントが作業中 */
  working: DashboardTicket[];
  /** ゲートにある(TODO を含む。依存が解消した TODO は ready) */
  gates: Array<DashboardTicket & { ready: boolean }>;
  doneWeek: DoneCount;
  doneMonth: DoneCount;
  recentProjects: Array<Pick<Project, 'id' | 'name' | 'updatedAt'>>;
  reflectionsPending: number;
  /** PR の作成失敗、起動の失敗など、人間の対応が要るもの */
  problems: Array<{ id: number; title: string; prError: string | null; launchError: string | null }>;
}
