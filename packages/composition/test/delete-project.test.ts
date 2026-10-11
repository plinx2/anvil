import fs from 'node:fs';
import path from 'node:path';
import { Role } from '@anvil/entity';
import { describe, expect, it } from 'vitest';
import { asRole, branchExists, human, setup } from './helpers';

describe('プロジェクトの削除', () => {
  it('関わるデータをすべて消し、リポジトリとブランチは残す', async () => {
    const { anvil, s, agents, project, repo, dir, idle } = await setup();
    const projectDir = path.join(dir, 'home', project.name);

    // チケット A: ブランチとワークツリーまで進める。エントリ、振り返り、依存、稼働中のエージェントがある
    const { ticket: a } = await s.tickets.create(human, {
      projectId: project.id,
      title: 'A',
      slug: 'feat/a',
      targetRepos: ['app'],
      state: 'pre_design_gate',
    });
    await s.flow.passDesignGate(human, { ticketId: a.id, sp: 2 });
    await idle();
    const worktree = (await s.tickets.detail(human, { ticketId: a.id })).detail.branches[0]?.worktreePath ?? '';
    expect(fs.existsSync(worktree)).toBe(true);
    await s.tickets.appendEntry(human, { ticketId: a.id, body: '設計した' });
    await s.reflections.save(asRole(Role.UI_DESIGNER), { ticketId: a.id, trouble: 'なし', target: 'role' });
    // チケット B: A に依存する
    const { ticket: b } = await s.tickets.create(human, { projectId: project.id, title: 'B', dependsOn: [a.id] });
    // 起票の依頼(起票担当が稼働中)
    const { intakeId } = await s.intakes.request(human, { projectId: project.id, items: [{ wish: 'C をやりたい' }] });
    await idle();
    // 別のプロジェクト(消えてはならない)
    const { project: other } = await s.projects.create(human, { name: 'other' });
    await s.tickets.create(human, { projectId: other.id, title: '別のチケット' });

    // 取り違え防止: 名前が一致しないと消えない
    await expect(s.projects.delete(human, { projectId: project.id, confirmName: 'oops' })).rejects.toMatchObject({ code: 'invalid' });
    expect((await s.tickets.board(human, { projectId: project.id })).tickets).toHaveLength(2);

    const result = await s.projects.delete(human, { projectId: project.id, confirmName: project.name });
    expect(result).toMatchObject({ tickets: 2, repos: 1, intakes: 1 });
    expect(result.keptBranches).toEqual(['app:feat/a']);

    // データベース: 関わるものはすべて消えた
    expect((await s.projects.list(human, {})).projects.map((p) => p.name)).toEqual(['other']);
    await expect(s.tickets.detail(human, { ticketId: a.id })).rejects.toMatchObject({ code: 'not_found' });
    await expect(s.tickets.detail(human, { ticketId: b.id })).rejects.toMatchObject({ code: 'not_found' });
    await expect(s.intakes.progress(human, { intakeId })).rejects.toBeDefined();
    expect((await s.reflections.list(human, {})).reflections).toHaveLength(0);
    await expect(s.tickets.entries(human, { ticketId: a.id })).rejects.toMatchObject({ code: 'not_found' });

    // ファイル: ワークツリーとプロジェクトコンテキストは消えた。リポジトリとブランチは残る
    expect(fs.existsSync(worktree)).toBe(false);
    expect(fs.existsSync(projectDir)).toBe(false);
    expect(fs.existsSync(repo)).toBe(true);
    expect(branchExists(repo, 'feat/a')).toBe(true);

    // 稼働中のエージェントは止められた
    expect(agents.calls.filter((c) => c.operation === 'stop').length).toBeGreaterThan(0);
    expect(anvil.fakes.notifier?.notifications.some((n) => n.title === 'プロジェクトを削除')).toBe(true);

    // 別のプロジェクトは無事。同じ名前で、作り直せる
    expect((await s.tickets.board(human, { projectId: other.id })).tickets).toHaveLength(1);
    expect((await s.projects.create(human, { name: project.name })).project.name).toBe(project.name);
    expect((await s.projects.addRepo(human, { projectId: other.id + 1, name: 'app', path: repo })).repos).toHaveLength(1); // 登録が消えたので、同じパスを登録し直せる
  });

  it('存在しないプロジェクトは not_found', async () => {
    const { s } = await setup();
    await expect(s.projects.delete(human, { projectId: 999, confirmName: 'x' })).rejects.toMatchObject({ code: 'not_found' });
  });
});
