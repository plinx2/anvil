import type { Notifier, RequestContext } from '@anvil/usecase';

/** 通知を出さずに、記録だけする(既定の構成と、テスト)。 */
export class RecordingNotifier implements Notifier {
  readonly notifications: Array<{ title: string; body: string }> = [];

  async notify(_ctx: RequestContext, title: string, body: string): Promise<void> {
    this.notifications.push({ title, body });
  }
}
