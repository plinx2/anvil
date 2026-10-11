import fs from 'node:fs';
import path from 'node:path';
import { Role } from '@anvil/entity';
import { describe, expect, it } from 'vitest';
import { asRole, git, human, setup } from './helpers';

/** チケットを設計前ゲートまで進めて、ブランチとワークツリーを切らせる。 */
async function cutWorktree(options: { include?: string; files: Record<string, string>; tracked?: string[] }) {
  const ctx = await setup();
  const { s, project, repo } = ctx;

  fs.writeFileSync(path.join(repo, '.gitignore'), '.env*\nsecret.txt\nnode_modules/\n');
  if (options.include !== undefined) fs.writeFileSync(path.join(repo, '.worktreeinclude'), options.include);
  for (const [file, content] of Object.entries(options.files)) {
    fs.mkdirSync(path.dirname(path.join(repo, file)), { recursive: true });
    fs.writeFileSync(path.join(repo, file), content);
  }
  git(repo, 'add', '.gitignore', ...(options.include !== undefined ? ['.worktreeinclude'] : []));
  for (const file of options.tracked ?? []) git(repo, 'add', '-f', file);
  git(repo, 'commit', '-m', 'setup');

  const { ticket } = await s.tickets.create(human, { projectId: project.id, title: 't', slug: 'feat/x' });
  await s.flow.start(human, { ticketId: ticket.id });
  await s.tickets.update(human, { ticketId: ticket.id, targetRepos: ['app'] });
  await s.flow.advance(asRole(Role.AC_REFINER), { ticketId: ticket.id });
  await s.flow.advance(asRole(Role.IMPL_PLANNER), { ticketId: ticket.id });
  return { ...ctx, ticketId: ticket.id };
}

describe('.worktreeinclude', () => {
  it('一覧にある gitignore 済みファイルだけを、ワークツリーへ写す', async () => {
    const { s, ticketId } = await cutWorktree({
      include: '.env\napps/*/.env.local\n',
      files: { '.env': 'A=1', 'apps/web/.env.local': 'B=2', 'secret.txt': 'x', 'node_modules/pkg/index.js': 'x' },
    });
    await s.flow.passDesignGate(human, { ticketId, sp: 1 });
    const { detail } = await s.tickets.detail(human, { ticketId });
    const wt = detail.branches[0]?.worktreePath ?? '';

    expect(fs.readFileSync(path.join(wt, '.env'), 'utf8')).toBe('A=1');
    expect(fs.readFileSync(path.join(wt, 'apps/web/.env.local'), 'utf8')).toBe('B=2');
    expect(fs.existsSync(path.join(wt, 'secret.txt'))).toBe(false); // 一覧に無い
    expect(fs.existsSync(path.join(wt, 'node_modules'))).toBe(false);
  });

  it('.worktreeinclude が無ければ、何も写さない', async () => {
    const { s, ticketId } = await cutWorktree({ files: { '.env': 'A=1' } });
    await s.flow.passDesignGate(human, { ticketId, sp: 1 });
    const { detail } = await s.tickets.detail(human, { ticketId });
    expect(fs.existsSync(path.join(detail.branches[0]?.worktreePath ?? '', '.env'))).toBe(false);
  });

  it('gitignore されていないファイルは、一覧にあっても写さない(追跡済みはチェックアウトで来る)', async () => {
    const { s, ticketId } = await cutWorktree({ include: 'a.txt\nnotes.md\n', files: { 'notes.md': 'untracked' } });
    await s.flow.passDesignGate(human, { ticketId, sp: 1 });
    const { detail } = await s.tickets.detail(human, { ticketId });
    const wt = detail.branches[0]?.worktreePath ?? '';
    expect(fs.existsSync(path.join(wt, 'notes.md'))).toBe(false);
    expect(fs.readFileSync(path.join(wt, 'a.txt'), 'utf8')).toBe('a');
  });
});
