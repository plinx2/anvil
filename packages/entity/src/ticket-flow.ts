import type { Kind } from './kind';

/** チケットの流れの形を決める 2 つ(種別と、デザインの要否)。 */
export interface TicketFlow {
  readonly kind: Kind;
  readonly designNeeded: boolean;
}
