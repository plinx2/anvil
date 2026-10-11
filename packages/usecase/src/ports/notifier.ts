import type { RequestContext } from '../request-context';

/** 人間への通知(承認待ち、着手可、起動の失敗など)。 */
export interface Notifier {
  notify(ctx: RequestContext, title: string, body: string): Promise<void>;
}
