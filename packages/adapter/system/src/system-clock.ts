import type { Clock, RequestContext } from '@anvil/usecase';

export class SystemClock implements Clock {
  now(_ctx: RequestContext): string {
    return new Date().toISOString();
  }

  date(_ctx: RequestContext): Date {
    return new Date();
  }
}
