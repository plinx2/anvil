import { Role } from '@anvil/entity';
import { describe, expect, it } from 'vitest';
import { asRole, human, setup } from './helpers';

/** herdr が受け付けるエージェント名: 小文字で始まり、小文字・数字・'-'・'_' だけの 32 文字以内 */
const HERDR_AGENT_NAME = /^[a-z][a-z0-9_-]{0,31}$/;

describe('エージェントの起動', () => {
  it('どのロールの名前も、herdr が受け付ける形になる', async () => {
    const { s, project, agents } = await setup();
    const { ticket: t } = await s.tickets.create(human, { projectId: project.id, title: 'x', slug: 'feat/names', targetRepos: ['app'] });
    await s.flow.start(human, { ticketId: t.id });
    await s.flow.advance(asRole(Role.AC_REFINER), { ticketId: t.id });
    await s.flow.advance(asRole(Role.IMPL_PLANNER), { ticketId: t.id });
    await s.flow.passDesignGate(human, { ticketId: t.id, sp: 1 });
    for (const role of [Role.UI_DESIGNER, Role.FUNC_DESIGNER, Role.QA]) await s.flow.advance(asRole(role), { ticketId: t.id });
    await s.flow.passImplGate(human, { ticketId: t.id });
    for (const role of [Role.CODER, Role.FUNC_VERIFIER, Role.UI_VERIFIER, Role.REVIEWER])
      await s.flow.advance(asRole(role), { ticketId: t.id });

    const names = agents.launchedNames();
    expect(names.length).toBeGreaterThanOrEqual(9);
    for (const name of names) expect(name, name).toMatch(HERDR_AGENT_NAME);
    // チケット番号が大きくなっても、収まる
    expect(`anvil_t${'9'.repeat(9)}_func_verifier`).toMatch(HERDR_AGENT_NAME);
  });

  it('最初のプロンプトに、ロールの定義の本文と、プロジェクトコンテキストの場所が入る(ファイルを読みに行かせない)', async () => {
    const { s, project, agents, dir } = await setup();
    const { ticket: t } = await s.tickets.create(human, { projectId: project.id, title: 'x' });
    await s.flow.start(human, { ticketId: t.id });

    const launch = agents.launches()[0];
    expect(launch?.prompt).toContain('# AC 担当'); // agents/roles/ac-refiner.md の本文
    expect(launch?.prompt).not.toMatch(/ロールの定義: .*ac-refiner\.md/); // パスだけを渡さない
    expect(launch?.addDirs).toEqual([expect.stringContaining('demo')]);
    expect(launch?.addDirs[0]).toContain(dir);
    expect(launch?.prompt).toContain(launch?.addDirs[0] ?? 'missing'); // 入口のパスは、許可された場所の中
  });

  it('コーディングの原則は、coder と reviewer のプロンプトにだけ入る', async () => {
    const { s, project, agents } = await setup();
    const { ticket: t } = await s.tickets.create(human, {
      projectId: project.id,
      title: 'x',
      state: 'pre_impl_gate',
      targetRepos: ['app'],
    });
    await s.flow.passImplGate(human, { ticketId: t.id });
    await s.flow.advance(asRole(Role.CODER), { ticketId: t.id });
    await s.flow.advance(asRole(Role.FUNC_VERIFIER), { ticketId: t.id });
    await s.flow.advance(asRole(Role.UI_VERIFIER), { ticketId: t.id });

    const byRole = new Map(agents.launches().map((l) => [l.role.id, l.prompt]));
    expect(byRole.get('coder')).toContain('## コーディングの原則');
    expect(byRole.get('func_verifier')).not.toContain('## コーディングの原則');
  });

  it('起動に失敗したら、チケットに失敗が残り、起動の記録は残らない。次の起動は新しいセッションで始まる', async () => {
    const { s, project, agents } = await setup();
    const { ticket: t } = await s.tickets.create(human, { projectId: project.id, title: 'x' });
    agents.launchError = new Error('herdr が落ちている');
    await s.flow.start(human, { ticketId: t.id });

    let { detail } = await s.tickets.detail(human, { ticketId: t.id });
    expect(detail.ticket.launchError).toContain('herdr が落ちている');
    expect(detail.launches).toEqual([]); // 存在しないセッションを、あとで再開しようとしない

    agents.launchError = null;
    await s.flow.startAgentOf(human, { ticketId: t.id });

    ({ detail } = await s.tickets.detail(human, { ticketId: t.id }));
    expect(detail.ticket.launchError).toBeNull();
    expect(detail.launches).toHaveLength(1);
    expect(agents.launches()).toHaveLength(1);
    expect(agents.launches()[0]?.session.resume).toBe(false);
  });
});
