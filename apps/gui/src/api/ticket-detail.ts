import type { operations } from './schema';

/** チケットの詳細(画面に見せる形) */
export type TicketDetail = operations['ticketDetail']['responses'][200]['content']['application/json']['detail'];
