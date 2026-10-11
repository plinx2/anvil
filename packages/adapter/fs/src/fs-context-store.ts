import fs from 'node:fs';
import path from 'node:path';
import type { Role } from '@anvil/entity';
import type { ContextPage, ContextStore, RequestContext } from '@anvil/usecase';

/** プロジェクトコンテキスト。Markdown のディレクトリ: <home>/<プロジェクト>/context/(入口は index.md、ロール別は roles/<ロール>.md)。 */
export class FsContextStore implements ContextStore {
  constructor(private readonly home: string) {}

  async ensure(_ctx: RequestContext, projectName: string): Promise<void> {
    const dir = this.contextDir(projectName);
    fs.mkdirSync(path.join(dir, 'roles'), { recursive: true });
    const index = path.join(dir, 'index.md');
    if (!fs.existsSync(index)) {
      fs.writeFileSync(
        index,
        `# ${projectName} のプロジェクトコンテキスト\n\n採用ツール、規約、既存コードの知識を、ここから各ページへリンクして書く。\nロール別の指示は roles/<ロール>.md に書く。\n`,
      );
    }
  }

  async pages(_ctx: RequestContext, projectName: string): Promise<ContextPage[]> {
    const root = this.contextDir(projectName);
    const pages: ContextPage[] = [];
    const walk = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith('.md')) {
          pages.push({ path: path.relative(root, full).replace(/\\/g, '/'), content: fs.readFileSync(full, 'utf8') });
        }
      }
    };
    walk(root);
    return pages;
  }

  dirPath(_ctx: RequestContext, projectName: string): string {
    return this.contextDir(projectName);
  }

  indexPath(_ctx: RequestContext, projectName: string): string {
    return path.join(this.contextDir(projectName), 'index.md');
  }

  rolePagePath(_ctx: RequestContext, projectName: string, role: Role): string {
    return path.join(this.contextDir(projectName), 'roles', `${role.id.replace(/_/g, '-')}.md`);
  }

  private contextDir(projectName: string): string {
    return path.join(this.home, projectName, 'context');
  }
}
