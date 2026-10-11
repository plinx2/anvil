import { randomUUID } from 'node:crypto';
import type { IdGenerator, RequestContext } from '@anvil/usecase';

export class CryptoIdGenerator implements IdGenerator {
  uuid(_ctx: RequestContext): string {
    return randomUUID();
  }
}
