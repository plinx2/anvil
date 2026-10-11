import type { operations } from './schema';

/** 振り返り(画面に見せる形) */
export type Reflection = operations['listReflections']['responses'][200]['content']['application/json']['reflections'][number];
