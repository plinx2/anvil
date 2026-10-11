import type { RequestContext } from '../request-context';

/** 結果を待たずに走らせる処理(エージェントの起動、PR の作成など)。失敗は、実装が記録する。 */
export interface TaskRunner {
  run(ctx: RequestContext, task: Promise<unknown>): void;
}
