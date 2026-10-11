import type { RequestContext } from '../request-context';

/**
 * トランザクションの境界。fn には、トランザクションを開始した接続を持つ文脈が渡される。
 * その文脈で呼んだ store の操作は、同じトランザクションに入る。fn が失敗したら、すべて取り消される。
 * fn の中では、外部(プロセス、通信)を待たない。
 */
export interface Transactor {
  transaction<T>(ctx: RequestContext, fn: (txCtx: RequestContext) => Promise<T>): Promise<T>;
}
