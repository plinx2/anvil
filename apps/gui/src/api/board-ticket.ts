import type { operations } from './schema';

/** カンバンの 1 枚のチケット(画面に見せる形) */
export type BoardTicket = operations['board']['responses'][200]['content']['application/json']['tickets'][number];
