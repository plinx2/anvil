import { AnvilError, type ErrorCode } from '@anvil/entity';
import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

/** 業務上のエラーのコードと、HTTP の状態の対応。 */
const STATUS_OF: Record<ErrorCode, 400 | 403 | 404 | 409> = {
  invalid: 400,
  not_found: 404,
  conflict: 409,
  forbidden: 403,
  blocked: 409,
};

/** どの失敗も、{ error, code } の形で返す。 */
export const errorHandler: ErrorHandler = (e, c) => {
  if (e instanceof AnvilError) return c.json({ error: e.message, code: e.code }, STATUS_OF[e.code]);
  if (e instanceof ZodError)
    return c.json({ error: e.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '), code: 'invalid' }, 400);
  if (e instanceof HTTPException) return c.json({ error: e.message, code: 'invalid' }, 400);
  console.error(e);
  return c.json({ error: (e as Error).message, code: 'internal' }, 500);
};
