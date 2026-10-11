import type { RequestContext } from '../request-context';

export interface Clock {
  /** ISO 8601 */
  now(ctx: RequestContext): string;
  date(ctx: RequestContext): Date;
}
