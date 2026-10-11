import { Category } from '@anvil/entity';
import { z } from 'zod';

const ids = Category.all.map((c) => c.id) as [string, ...string[]];

/** カテゴリの識別子 */
export const CategoryIdSchema = z.enum(ids);
