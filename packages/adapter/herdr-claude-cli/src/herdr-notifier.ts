import type { Notifier, RequestContext } from '@anvil/usecase';
import type { HerdrCli } from './herdr-cli';

/** herdr の画面に、通知を出す(承認待ち、着手可など)。失敗しても、処理は止めない。 */
export class HerdrNotifier implements Notifier {
  constructor(private readonly cli: HerdrCli) {}

  async notify(_ctx: RequestContext, title: string, body: string): Promise<void> {
    await this.cli.call(['notification', 'show', title, '--body', body, '--sound', 'request']).catch(() => undefined);
  }
}
