import { Role } from '@anvil/entity';
import { z } from 'zod';

const ids = Role.all.map((r) => r.id) as [string, ...string[]];

/** ロールの識別子 */
export const RoleIdSchema = z.enum(ids);
