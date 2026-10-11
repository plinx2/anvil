import fs from 'node:fs';
import path from 'node:path';
import type { Role } from '@anvil/entity';
import type { RequestContext, RoleDefinitions } from '@anvil/usecase';

/** ロールごとの定義のファイル名(agents/roles/) */
const ROLE_FILES: Readonly<Record<string, string>> = {
  pbi_author: 'pbi-author.md',
  ac_refiner: 'ac-refiner.md',
  impl_planner: 'impl-planner.md',
  ui_designer: 'ui-design.md',
  func_designer: 'functional-design.md',
  qa: 'test-design.md',
  coder: 'coder.md',
  func_verifier: 'verification.md',
  ui_verifier: 'verification.md',
  reviewer: 'reviewer.md',
  pr_writer: 'pr-writer.md',
};

/** ロールの定義の置き場(リポジトリの agents/ ディレクトリ)。 */
export class FsRoleDefinitions implements RoleDefinitions {
  constructor(private readonly agentsDir: string) {}

  roleDoc(_ctx: RequestContext, role: Role): string {
    return fs.readFileSync(path.join(this.agentsDir, 'roles', ROLE_FILES[role.id] ?? `${role.id}.md`), 'utf8');
  }

  codingPrinciples(_ctx: RequestContext): string {
    return fs.readFileSync(path.join(this.agentsDir, 'coding-principles.md'), 'utf8');
  }
}
