import type { Actor } from '@anvil/entity';
import type { ContextKey } from './context-key';

/**
 * リクエストの文脈(Go の Context のように、すべての層の第一引数で運ぶ)。
 * 操作の主体、トランザクションなど、リクエストの範囲で共有する情報は、ここに載る。変更は、新しい文脈を返す(元は変えない)。
 */
export interface RequestContext {
  /** 誰の操作か */
  readonly actor: Actor;
  get<T>(key: ContextKey<T>): T | undefined;
  with<T>(key: ContextKey<T>, value: T): RequestContext;
  withActor(actor: Actor): RequestContext;
}

class ValueRequestContext implements RequestContext {
  constructor(
    readonly actor: Actor,
    private readonly values: ReadonlyMap<ContextKey<unknown>, unknown>,
  ) {}

  get<T>(key: ContextKey<T>): T | undefined {
    return this.values.get(key) as T | undefined;
  }

  with<T>(key: ContextKey<T>, value: T): RequestContext {
    return new ValueRequestContext(this.actor, new Map(this.values).set(key, value));
  }

  withActor(actor: Actor): RequestContext {
    return new ValueRequestContext(actor, this.values);
  }
}

/** リクエストの入り口(HTTP、MCP、コマンド)が、最初に作る文脈。 */
export function newRequestContext(actor: Actor): RequestContext {
  return new ValueRequestContext(actor, new Map());
}
