import { Actor, Role } from '@anvil/entity';
import { ContextKey, newRequestContext } from '@anvil/usecase';
import { describe, expect, it } from 'vitest';

describe('RequestContext', () => {
  it('操作の主体を持ち、変更は、新しい文脈を返す(元は変えない)', () => {
    const human = newRequestContext(Actor.human());
    const coder = human.withActor(Actor.ofRole(Role.CODER));
    expect(human.actor.isHuman).toBe(true);
    expect(coder.actor.role).toBe(Role.CODER);
  });

  it('鍵で、値を運べる(アダプターが、自分の情報を載せる)', () => {
    const key = new ContextKey<string>('test');
    const ctx = newRequestContext(Actor.human());
    const carried = ctx.with(key, 'value');
    expect(carried.get(key)).toBe('value');
    expect(ctx.get(key)).toBeUndefined();
    expect(carried.withActor(Actor.auto()).get(key)).toBe('value'); // 主体を変えても、運んだ値は残る
  });
});
