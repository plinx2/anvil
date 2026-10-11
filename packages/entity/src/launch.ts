import type { Role } from './role';
import type { State } from './state';

/** エージェントの起動の記録。エントリを 1 件も書く前に止まっても、セッション ID が残る。 */
export interface Launch {
  readonly id: number;
  /** チケットが未定の起票エージェントは null(起票されたときに、紐づける) */
  readonly ticketId: number | null;
  readonly intakeItemId: number | null;
  readonly state: State | null;
  readonly role: Role;
  /** herdr 上の名前。送り先は、anvil が付けたこの名前だけ */
  readonly name: string;
  readonly sessionId: string;
  readonly startedAt: string;
  readonly endedAt: string | null;
}
