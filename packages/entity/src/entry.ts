import type { State } from './state';

export type EntryAuthorKind = 'human' | 'agent';

/** チケットに追記する記録。追記のみで、書き換えない。種類は持たず、内容はすべて本文に書く。 */
export interface Entry {
  readonly id: number;
  readonly ticketId: number;
  readonly state: State;
  /** 書き手のロールの id。人間が書いたエントリは 'human' */
  readonly role: string;
  readonly authorKind: EntryAuthorKind;
  readonly body: string;
  readonly createdAt: string;
}
