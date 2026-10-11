import type { Role } from './role';
import type { State } from './state';

/** 改善の対象 */
export type ReflectionTarget = 'role' | 'anvil' | 'skill' | 'project_doc';
/** 採否。採用しても、anvil は反映しない(オーナーが自分で書く、または Claude に書かせる) */
export type ReflectionStatus = 'pending' | 'adopted' | 'rejected';

export const REFLECTION_TARGETS: readonly ReflectionTarget[] = ['role', 'anvil', 'skill', 'project_doc'];
export const REFLECTION_STATUSES: readonly ReflectionStatus[] = ['pending', 'adopted', 'rejected'];

/** 作業完了時の振り返り。 */
export interface Reflection {
  readonly id: number;
  readonly ticketId: number | null;
  readonly role: Role;
  readonly state: State | null;
  readonly sessionId: string | null;
  readonly good: string;
  readonly trouble: string;
  readonly hypothesis: string;
  readonly proposal: string;
  readonly target: ReflectionTarget;
  readonly evidence: string;
  readonly status: ReflectionStatus;
  readonly rejectReason: string | null;
  readonly createdAt: string;
  readonly decidedAt: string | null;
}
