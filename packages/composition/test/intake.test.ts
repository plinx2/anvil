import { Role } from '@anvil/entity';
import { describe, expect, it } from 'vitest';
import { asRole, human, setup } from './helpers';

describe('起票の依頼(分割・スパイク共通)', () => {
  it('分割: 1 件ずつ順に起動し、全部起票されたら元を破棄する', async () => {
    const { s, agents, project, idle } = await setup();
    const { ticket: source } = await s.tickets.create(human, { projectId: project.id, title: '大きなチケット', state: 'dev_refine' });
    await idle();
    await expect(s.intakes.request(asRole(Role.CODER), { sourceTicketId: source.id, items: [{ wish: 'x' }] })).rejects.toMatchObject({
      code: 'forbidden',
    });

    const { intakeId } = await s.intakes.request(asRole(Role.IMPL_PLANNER), {
      sourceTicketId: source.id,
      discard: true,
      items: [{ wish: '前半' }, { wish: '後半' }],
    });
    await idle();
    const started = () => agents.launchedNames().filter((n) => n.includes(`intake${intakeId}`)).length;
    expect(started()).toBe(1); // 1 件目だけ

    const { items } = await s.intakes.progress(human, { intakeId });
    const { ticket: first } = await s.tickets.create(human, { projectId: project.id, title: '前半', intakeItemId: items[0]?.id });
    await idle();
    expect(started()).toBe(2); // 2 件目を起動

    await s.tickets.create(human, { projectId: project.id, title: '後半', intakeItemId: items[1]?.id, dependsOn: [first.id] });
    await idle();
    expect((await s.intakes.progress(human, { intakeId })).intake.status).toBe('done');
    await expect(s.tickets.detail(human, { ticketId: source.id })).rejects.toMatchObject({ code: 'not_found' }); // 元は破棄された
    // 起票エージェントの起動の記録は、チケットに紐づいた
    expect((await s.tickets.detail(human, { ticketId: first.id })).detail.launches.some((l) => l.role === 'pbi_author')).toBe(true);
  });

  it('スパイク: 元は残り、スパイクに依存する。スパイクが完了すると、元の担当が再開する', async () => {
    const { s, project, idle } = await setup();
    const { ticket: source } = await s.tickets.create(human, { projectId: project.id, title: '元', state: 'dev_refine' });
    await idle();
    const { intakeId } = await s.intakes.request(asRole(Role.IMPL_PLANNER), {
      sourceTicketId: source.id,
      discard: false,
      items: [{ wish: '実現可能性の調査', kind: 'spike' }],
    });
    await idle();
    const item = (await s.intakes.progress(human, { intakeId })).items[0];
    const { ticket: spike } = await s.tickets.create(human, {
      projectId: project.id,
      title: '調査',
      kind: 'spike',
      intakeItemId: item?.id,
    });
    await idle();
    expect(spike.state).toBe('pre_impl_gate'); // 実装前ゲートで生まれる

    const { detail: d } = await s.tickets.detail(human, { ticketId: source.id });
    expect(d.ticket.state).toBe('dev_refine');
    expect(d.ticket.unmet).toEqual([spike.id]);
    await expect(s.flow.advance(asRole(Role.IMPL_PLANNER), { ticketId: source.id })).rejects.toThrow(/依存先が未完了/);

    // スパイク: 実装前ゲート → 実装 → 完了前ゲート → 完了
    await s.flow.passImplGate(human, { ticketId: spike.id });
    await s.flow.advance(asRole(Role.CODER), { ticketId: spike.id });
    expect((await s.tickets.detail(human, { ticketId: spike.id })).detail.ticket.state).toBe('pre_done_gate');
    await s.flow.passDoneGate(human, { ticketId: spike.id });

    const active = (await s.tickets.detail(human, { ticketId: source.id })).detail.launches.filter((l) => !l.endedAt);
    expect(active.map((l) => l.role)).toEqual(['impl_planner']);
  });

  it('GUI の起票ボタン(元のチケット無し): プロジェクトを指定して、起票担当を起動する', async () => {
    const { s, agents, project, idle } = await setup();
    const { intakeId } = await s.intakes.request(human, { projectId: project.id, items: [{ wish: 'ログインしたい' }] });
    await idle();
    expect(agents.launchedNames()).toEqual([`anvil_intake${intakeId}-0_pbi_author`]);
  });
});
