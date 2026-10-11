import type { Kind } from './kind';
import type { State } from './state';

/** 起票の依頼の 1 件。1 件ずつ順に、PBI 起票担当を起動する。 */
export interface IntakeItem {
  readonly id: number;
  readonly intakeId: number;
  readonly seq: number;
  readonly wish: string;
  readonly kind: Kind;
  readonly startState: State | null;
  readonly slug: string | null;
  readonly autoGate: boolean;
  readonly dependsOn: readonly number[];
  readonly ticketId: number | null;
  readonly status: 'pending' | 'running' | 'done';
}
