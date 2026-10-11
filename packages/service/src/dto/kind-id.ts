import { Kind } from '@anvil/entity';
import { z } from 'zod';

const ids = Kind.all.map((k) => k.id) as [string, ...string[]];

/** 種別の識別子(standard、spike) */
export const KindIdSchema = z.enum(ids);
