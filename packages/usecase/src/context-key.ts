/** リクエストの文脈に、値を入れるときの鍵。アダプターが、自分の情報(トランザクションなど)を運ぶのに使う。 */
export class ContextKey<T> {
  /** 型の目印(実行時には使わない) */
  declare readonly valueType: T;

  constructor(readonly name: string) {}
}
