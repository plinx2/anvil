import { z } from '@hono/zod-openapi';

export const ErrorBodySchema = z.object({ error: z.string(), code: z.string() });

const errorContent = { 'application/json': { schema: ErrorBodySchema } };

/** どの操作でも起こりうる、失敗の応答。 */
export const ERROR_RESPONSES = {
  400: { description: '入力が不正', content: errorContent },
  403: { description: '権限が無い(担当でないロール、人間だけの操作)', content: errorContent },
  404: { description: '見つからない', content: errorContent },
  409: { description: '今はできない(状態、依存、重複、承認待ちなど)', content: errorContent },
} as const;
