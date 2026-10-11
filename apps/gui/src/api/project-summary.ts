import type { operations } from './schema';

/** プロジェクト一覧の 1 件(画面に見せる形) */
export type ProjectSummary = operations['listProjects']['responses'][200]['content']['application/json']['projects'][number];
