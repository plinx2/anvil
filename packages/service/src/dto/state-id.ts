import { State } from '@anvil/entity';
import { z } from 'zod';

const ids = State.all.map((s) => s.id) as [string, ...string[]];

/** 状態の識別子(todo、refine、…、done)。JSON で運ぶときの形。 */
export const StateIdSchema = z.enum(ids);
