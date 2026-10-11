import type { Actor } from './actor';
import type { State } from './state';

/** 状態の履歴。誰が、いつ、どの状態からどの状態へ動かしたか。 */
export interface History {
  readonly id: number;
  readonly ticketId: number;
  readonly fromState: State | null;
  readonly toState: State;
  readonly actor: Actor;
  readonly createdAt: string;
}
