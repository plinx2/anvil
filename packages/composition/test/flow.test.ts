import fs from 'node:fs';
import { Role } from '@anvil/entity';
import { describe, expect, it } from 'vitest';
import { asRole, auto, branchExists, git, human, setup } from './helpers';

const IMPLEMENTATION_ROLES = [Role.CODER, Role.FUNC_VERIFIER, Role.UI_VERIFIER, Role.REVIEWER];

describe('状態の流れ', () => {
  it('標準の流れを最後まで通る(ブランチ、ワークツリー、PR、完了)', async () => {
    const { s, agents, pullRequests, project, repo, idle } = await setup();
    const { ticket: t } = await s.tickets.create(human, { projectId: project.id, title: 'ログイン画面', slug: 'feat/login' });
    expect(t.state).toBe('todo');

    await s.flow.start(human, { ticketId: t.id });
    expect((await s.tickets.detail(human, { ticketId: t.id })).detail.ticket.state).toBe('refine');
    expect(agents.launchedNames()).toEqual([`anvil_t${t.id}_ac_refiner`]);

    // 担当でないロールは進められない
    await expect(s.flow.advance(asRole(Role.CODER), { ticketId: t.id })).rejects.toMatchObject({ code: 'forbidden' });

    await s.flow.advance(asRole(Role.AC_REFINER), { ticketId: t.id, handoff: '価値とのずれは無かった' });
    let { detail } = await s.tickets.detail(human, { ticketId: t.id });
    expect(detail.ticket.state).toBe('dev_refine');
    expect(detail.launches[0]?.endedAt).not.toBeNull(); // 前のエージェントは終了した
    expect(detail.launches.filter((l) => !l.endedAt)).toHaveLength(1);

    // 設計前ゲート: 対象リポジトリが未設定なら止まる。SP は必須。人間だけ。
    await s.flow.advance(asRole(Role.IMPL_PLANNER), { ticketId: t.id });
    ({ detail } = await s.tickets.detail(human, { ticketId: t.id }));
    expect(detail.ticket.state).toBe('pre_design_gate');
    expect(detail.launches.filter((l) => !l.endedAt)).toHaveLength(0);
    await expect(s.flow.passDesignGate(human, { ticketId: t.id, sp: 3 })).rejects.toThrow(/対象リポジトリ/);
    await s.tickets.update(human, { ticketId: t.id, targetRepos: ['app'] });
    await expect(s.flow.passDesignGate(human, { ticketId: t.id, sp: 0 })).rejects.toThrow(/SP/);
    await expect(s.flow.passDesignGate(auto, { ticketId: t.id, sp: 3 })).rejects.toMatchObject({ code: 'forbidden' });
    await s.flow.passDesignGate(human, { ticketId: t.id, sp: 3 });
    ({ detail } = await s.tickets.detail(human, { ticketId: t.id }));
    expect(detail.ticket.state).toBe('ui_design');
    expect(detail.ticket.sp).toBe(3);
    expect(branchExists(repo, 'feat/login')).toBe(true);
    const worktree = detail.branches[0]?.worktreePath ?? '';
    expect(fs.existsSync(worktree)).toBe(true);

    // slug は、ブランチを切った後は変えられない
    await expect(s.tickets.update(human, { ticketId: t.id, slug: 'other' })).rejects.toThrow(/slug/);

    for (const role of [Role.UI_DESIGNER, Role.FUNC_DESIGNER, Role.QA]) await s.flow.advance(asRole(role), { ticketId: t.id });
    expect((await s.tickets.detail(human, { ticketId: t.id })).detail.ticket.state).toBe('pre_impl_gate');
    await expect(s.flow.passImplGate(auto, { ticketId: t.id })).rejects.toThrow(/OFF/);
    await s.flow.passImplGate(human, { ticketId: t.id });
    for (const role of IMPLEMENTATION_ROLES) await s.flow.advance(asRole(role), { ticketId: t.id });
    ({ detail } = await s.tickets.detail(human, { ticketId: t.id }));
    expect(detail.ticket.state).toBe('pre_done_gate');

    await idle();
    expect(pullRequests.calls).toHaveLength(1);
    expect(pullRequests.calls[0]?.branch).toBe('feat/login');
    expect(Object.values((await s.tickets.detail(human, { ticketId: t.id })).detail.ticket.prUrls)[0]).toMatch(/dry-run/);

    // 完了前ゲートからの差し戻しは「実装」へ。再到達では、既存の PR を更新する
    await s.flow.rollback(human, { ticketId: t.id, reason: 'テストが足りない' });
    expect((await s.tickets.detail(human, { ticketId: t.id })).detail.ticket.state).toBe('impl');
    for (const role of IMPLEMENTATION_ROLES) await s.flow.advance(asRole(role), { ticketId: t.id });
    await idle();
    expect(pullRequests.calls).toHaveLength(2);
    expect(pullRequests.calls[1]?.existingUrl).toBeTruthy();

    await expect(s.flow.passDoneGate(auto, { ticketId: t.id })).rejects.toMatchObject({ code: 'forbidden' });
    await s.flow.passDoneGate(human, { ticketId: t.id });
    ({ detail } = await s.tickets.detail(human, { ticketId: t.id }));
    expect(detail.ticket.state).toBe('done');
    expect(fs.existsSync(worktree)).toBe(false); // ワークツリーは消え、
    expect(branchExists(repo, 'feat/login')).toBe(true); // ブランチは残る

    // 差し戻しの理由はエントリに、実行者は履歴に残る
    expect(detail.entries.some((e) => e.body.includes('テストが足りない') && e.role === 'human')).toBe(true);
    expect(detail.ticket.rollbacks).toBe(1);
    expect(detail.history.some((h) => h.toState === 'impl' && h.actor.kind === 'human')).toBe(true);
  });

  it('デザイン不要のチケットは、デザインの状態を飛ばす', async () => {
    const { s, project } = await setup();
    const { ticket: t } = await s.tickets.create(human, {
      projectId: project.id,
      title: 'x',
      state: 'pre_design_gate',
      designNeeded: false,
      targetRepos: ['app'],
    });
    await s.flow.passDesignGate(human, { ticketId: t.id, sp: 1 });
    expect((await s.tickets.detail(human, { ticketId: t.id })).detail.ticket.state).toBe('func_design');
  });

  it('自動ゲート承認フラグ: 実装前ゲートを判断なしで突破し、履歴に「自動」が残る', async () => {
    const { s, project, idle } = await setup();
    const { ticket: t } = await s.tickets.create(human, { projectId: project.id, title: 'x', state: 'test_design', autoGate: true });
    await idle();
    await s.flow.advance(asRole(Role.QA), { ticketId: t.id });
    const { detail: d } = await s.tickets.detail(human, { ticketId: t.id });
    expect(d.ticket.state).toBe('impl');
    expect(d.history.some((h) => h.fromState === 'pre_impl_gate' && h.actor.kind === 'auto')).toBe(true);
  });

  it('自動ゲート承認フラグは、起票後に ON にしても効く', async () => {
    const { s, project, idle } = await setup();
    const { ticket: t } = await s.tickets.create(human, { projectId: project.id, title: 'x', state: 'pre_impl_gate' });
    await idle();
    await s.tickets.changeAutoGate(human, { ticketId: t.id, on: true });
    await idle();
    expect((await s.tickets.detail(human, { ticketId: t.id })).detail.ticket.state).toBe('impl');
  });
});

describe('承認待ちフラグ', () => {
  it('立てている間は進められず、回答で同じ状態が続く', async () => {
    const { s, agents, project, idle } = await setup();
    const { ticket: t } = await s.tickets.create(human, { projectId: project.id, title: 'x', state: 'refine' });
    await idle();
    await s.flags.ask(asRole(Role.AC_REFINER), { ticketId: t.id, question: 'この AC は A と B のどちらですか' });
    expect((await s.dashboard.show(human, {})).dashboard.awaiting).toHaveLength(1);
    await expect(s.flow.advance(asRole(Role.AC_REFINER), { ticketId: t.id })).rejects.toThrow(/承認待ち/);
    await expect(s.flags.answer(asRole(Role.AC_REFINER), { ticketId: t.id, answer: 'x' })).rejects.toMatchObject({ code: 'forbidden' });

    const before = agents.calls.length;
    await s.flags.answer(human, { ticketId: t.id, answer: 'A です' });
    const { detail: d } = await s.tickets.detail(human, { ticketId: t.id });
    expect(d.ticket.awaiting).toBe(false);
    expect(d.ticket.state).toBe('refine');
    expect(agents.calls.length).toBeGreaterThan(before); // エージェントがいる(記録上)ので、入力を送る
    expect(d.entries.at(-1)?.role).toBe('human');
  });

  it('会話の中でエージェントが代わりに書いたとき(viaAgent)は、そのエージェントに送り込まない', async () => {
    const { s, agents, project, idle } = await setup();
    const { ticket: t } = await s.tickets.create(human, { projectId: project.id, title: 'x', state: 'refine' });
    await idle();
    await s.flags.ask(asRole(Role.AC_REFINER), { ticketId: t.id, question: '?' });
    const before = agents.calls.length;
    await s.flags.answer(human, { ticketId: t.id, answer: 'A', viaAgent: true });
    expect(agents.calls.length).toBe(before);
  });

  it('エージェントがいないとき: 着手で、同じ状態の途中なら前のセッションを再開する', async () => {
    const { s, agents, project, idle } = await setup();
    const { ticket: t } = await s.tickets.create(human, { projectId: project.id, title: 'x', state: 'refine' });
    await idle();
    const first = (await s.tickets.detail(human, { ticketId: t.id })).detail.launches[0];
    agents.running = false; // 落ちている
    await s.flow.startAgentOf(human, { ticketId: t.id });
    const launches = (await s.tickets.detail(human, { ticketId: t.id })).detail.launches;
    expect(launches.at(-1)?.sessionId).toBe(first?.sessionId);
    expect(agents.launches().at(-1)?.session).toEqual({ id: first?.sessionId, resume: true });
  });
});

describe('エージェントの起動', () => {
  it('モデルは、基本は standard。起票担当も standard', async () => {
    const { s, agents, project, idle } = await setup();
    await s.tickets.create(human, { projectId: project.id, title: 'x', state: 'refine' });
    await idle();
    expect(agents.launches()[0]?.modelTier.id).toBe('standard');
  });
});

describe('依存', () => {
  it('依存先が未完了なら進められず、完了すると「着手可」になる', async () => {
    const { s, notifier, project, idle } = await setup();
    const { ticket: a } = await s.tickets.create(human, { projectId: project.id, title: 'a', state: 'pre_done_gate' });
    const { ticket: b } = await s.tickets.create(human, { projectId: project.id, title: 'b', dependsOn: [a.id] });
    await idle();
    await expect(s.flow.start(human, { ticketId: b.id })).rejects.toThrow(/依存先が未完了/);
    expect((await s.tickets.detail(human, { ticketId: b.id })).detail.ticket.ready).toBe(false);

    await s.flow.passDoneGate(human, { ticketId: a.id });
    const { detail: d } = await s.tickets.detail(human, { ticketId: b.id });
    expect(d.ticket.ready).toBe(true);
    expect(d.ticket.state).toBe('todo'); // 自動ではリファインに進まない
    expect(notifier.notifications.some((n) => n.title === '着手可')).toBe(true);
    await expect(s.tickets.addDependency(human, { ticketId: a.id, dependsOnId: b.id })).rejects.toThrow(/循環/);
  });
});

describe('slug とブランチ', () => {
  it('slug の重複は拒否し、ブランチの衝突は設計前ゲートの突破を止める', async () => {
    const { s, project, repo } = await setup();
    await s.tickets.create(human, { projectId: project.id, title: 'a', slug: 'same' });
    await expect(s.tickets.create(human, { projectId: project.id, title: 'b', slug: 'same' })).rejects.toThrow(/重複/);

    git(repo, 'branch', 'taken');
    const { ticket: t } = await s.tickets.create(human, {
      projectId: project.id,
      title: 'c',
      slug: 'taken',
      state: 'pre_design_gate',
      targetRepos: ['app'],
    });
    await expect(s.flow.passDesignGate(human, { ticketId: t.id, sp: 2 })).rejects.toThrow(/同名のブランチ/);
    expect((await s.tickets.detail(human, { ticketId: t.id })).detail.ticket.state).toBe('pre_design_gate');

    await s.tickets.update(human, { ticketId: t.id, slug: 'fresh' }); // 切る前なら変えられる
    await s.flow.passDesignGate(human, { ticketId: t.id, sp: 2 });
    expect(branchExists(repo, 'fresh')).toBe(true);
  });

  it('日本語のタイトルでも、slug は番号で決まる', async () => {
    const { s, project } = await setup();
    const { ticket: a } = await s.tickets.create(human, { projectId: project.id, title: 'ログイン' });
    const { ticket: b } = await s.tickets.create(human, { projectId: project.id, title: 'ログアウト' });
    expect(a.slug).toMatch(/^t-\d+$/);
    expect(b.slug).not.toBe(a.slug);
  });

  it('差し戻し: 理由は必須。ブランチは残して再利用する', async () => {
    const { s, project, repo } = await setup();
    const { ticket: t } = await s.tickets.create(human, {
      projectId: project.id,
      title: 'a',
      slug: 'keep',
      state: 'pre_design_gate',
      targetRepos: ['app'],
    });
    await s.flow.passDesignGate(human, { ticketId: t.id, sp: 1 });
    await expect(s.flow.rollback(human, { ticketId: t.id, reason: ' ' })).rejects.toThrow(/理由/);

    await s.flow.rollback(asRole(Role.UI_DESIGNER), { ticketId: t.id, reason: 'AC があいまい', target: 'refine' });
    expect((await s.tickets.detail(human, { ticketId: t.id })).detail.ticket.state).toBe('refine');
    expect(branchExists(repo, 'keep')).toBe(true);

    await s.flow.advance(asRole(Role.AC_REFINER), { ticketId: t.id });
    await s.flow.advance(asRole(Role.IMPL_PLANNER), { ticketId: t.id });
    await s.flow.passDesignGate(human, { ticketId: t.id, sp: 2 }); // 再利用する(衝突で止まらない)
    expect((await s.tickets.detail(human, { ticketId: t.id })).detail.ticket.state).toBe('ui_design');
  });

  it('破棄: ブランチとワークツリーは残して、人間に知らせる', async () => {
    const { s, notifier, project, repo } = await setup();
    const { ticket: t } = await s.tickets.create(human, {
      projectId: project.id,
      title: 'a',
      slug: 'gone',
      state: 'pre_design_gate',
      targetRepos: ['app'],
    });
    await s.flow.passDesignGate(human, { ticketId: t.id, sp: 1 });
    expect(await s.tickets.discard(human, { ticketId: t.id })).toEqual({ keptBranches: ['app:gone'] });
    expect(branchExists(repo, 'gone')).toBe(true);
    expect(notifier.notifications.some((n) => n.title === 'チケットを破棄')).toBe(true);
    await expect(s.tickets.detail(human, { ticketId: t.id })).rejects.toMatchObject({ code: 'not_found' });
  });
});

describe('PR とダッシュボード', () => {
  it('PR の作成に失敗しても、完了前ゲートへの到達は止めない', async () => {
    const { s, pullRequests, project, idle } = await setup();
    pullRequests.failWith = 'remote に繋がらない';
    const { ticket: t } = await s.tickets.create(human, { projectId: project.id, title: 'a', state: 'review', targetRepos: ['app'] });
    await idle();
    await s.flow.advance(asRole(Role.REVIEWER), { ticketId: t.id });
    await idle();
    const { detail: d } = await s.tickets.detail(human, { ticketId: t.id });
    expect(d.ticket.state).toBe('pre_done_gate');
    expect(d.ticket.prError).toMatch(/remote/);
    expect((await s.dashboard.show(human, {})).dashboard.problems).toHaveLength(1);

    pullRequests.failWith = null;
    expect((await s.flow.rebuildPr(human, { ticketId: t.id })).ticket.prError).toBeNull();
  });

  it('完了数と昨対、振り返りの件数', async () => {
    const { s, project, idle } = await setup();
    const { ticket: t } = await s.tickets.create(human, { projectId: project.id, title: 'a', state: 'pre_done_gate' });
    await idle();
    await s.flow.passDoneGate(human, { ticketId: t.id });
    const { dashboard: d } = await s.dashboard.show(human, {});
    expect(d.doneWeek).toEqual({ count: 1, lastYear: 0 });
    expect(d.doneMonth.count).toBe(1);

    const { reflection: r } = await s.reflections.save(asRole(Role.CODER), {
      ticketId: t.id,
      trouble: '指示があいまい',
      proposal: '例を足す',
      target: 'role',
    });
    expect(r.role).toBe('coder');
    expect((await s.dashboard.show(human, {})).dashboard.reflectionsPending).toBe(1);
    await s.reflections.decide(human, { reflectionId: r.id, status: 'adopted' });
    expect((await s.dashboard.show(human, {})).dashboard.reflectionsPending).toBe(0);
    await expect(s.reflections.save(human, { trouble: 'x' })).rejects.toMatchObject({ code: 'forbidden' });
  });
});
