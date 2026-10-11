import type { operations } from './schema';

/** ダッシュボード(画面に見せる形) */
export type Dashboard = operations['dashboard']['responses'][200]['content']['application/json']['dashboard'];
