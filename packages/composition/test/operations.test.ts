import { OPERATIONS } from '@anvil/service';
import { describe, expect, it } from 'vitest';
import { setup } from './helpers';

describe('操作の一覧(operations.ts)', () => {
  it('サービスのすべてのメソッドが、一覧に載っている(入口に足し忘れない)', async () => {
    const { anvil } = await setup();
    const methods = Object.entries(anvil.service).flatMap(([group, service]) =>
      Object.getOwnPropertyNames(Object.getPrototypeOf(service))
        .filter((m) => m !== 'constructor' && typeof (service as Record<string, unknown>)[m] === 'function')
        .map((m) => `${group}.${m}`),
    );
    expect(OPERATIONS.map((o) => o.id).sort()).toEqual(methods.sort());
  });
});
