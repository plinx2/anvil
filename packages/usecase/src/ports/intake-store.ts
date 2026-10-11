import type { Intake, IntakeItem, NewOf } from '@anvil/entity';
import type { RequestContext } from '../request-context';

export interface IntakeStore {
  create(ctx: RequestContext, intake: NewOf<Intake>, items: Array<NewOf<IntakeItem>>): Promise<{ intake: Intake; items: IntakeItem[] }>;
  get(ctx: RequestContext, id: number): Promise<Intake | null>;
  listByProject(ctx: RequestContext, projectId: number): Promise<Intake[]>;
  /** プロジェクトの起票の依頼を、項目ごと消す */
  deleteByProject(ctx: RequestContext, projectId: number): Promise<void>;
  save(ctx: RequestContext, intake: Intake): Promise<void>;
  items(ctx: RequestContext, intakeId: number): Promise<IntakeItem[]>;
  getItem(ctx: RequestContext, id: number): Promise<IntakeItem | null>;
  saveItem(ctx: RequestContext, item: IntakeItem): Promise<void>;
}
