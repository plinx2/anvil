import type { RequestContext } from '../request-context';

export interface IdGenerator {
  uuid(ctx: RequestContext): string;
}
