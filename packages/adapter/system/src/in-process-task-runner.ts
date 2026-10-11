import type { RequestContext, TaskRunner } from '@anvil/usecase';

/** プロセスの中で、結果を待たずに走らせる。失敗は、記録して表示するだけで、落とさない。完了の待ち合わせもできる。 */
export class InProcessTaskRunner implements TaskRunner {
  private readonly pending = new Set<Promise<unknown>>();
  readonly errors: unknown[] = [];

  run(_ctx: RequestContext, task: Promise<unknown>): void {
    const tracked: Promise<unknown> = task
      .catch((e) => {
        this.errors.push(e);
        console.error('[anvil] background task failed:', e);
      })
      .finally(() => this.pending.delete(tracked));
    this.pending.add(tracked);
  }

  /** 走っている処理が、すべて終わるまで待つ(終了処理、テスト) */
  async idle(): Promise<void> {
    while (this.pending.size > 0) await Promise.allSettled([...this.pending]);
  }
}
