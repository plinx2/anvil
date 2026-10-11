import { describe, expect, it } from 'vitest';
import { Actor, Kind, Role, Slug, State, Ticket, type TicketProps } from '../src';

const AT = '2026-10-11T00:00:00.000Z';

function ticketOf(patch: Partial<TicketProps> = {}): Ticket {
  return new Ticket({
    id: 1,
    projectId: 1,
    title: 't',
    body: '',
    kind: Kind.STANDARD,
    state: State.REFINE,
    awaiting: false,
    autoGate: false,
    sp: null,
    designNeeded: true,
    slug: 't-1',
    targetRepos: [],
    prUrls: {},
    prError: null,
    launchError: null,
    createdAt: AT,
    updatedAt: AT,
    doneAt: null,
    ...patch,
  });
}

describe('Ticket', () => {
  it('状態の遷移は、新しいチケットを返し、元は変えない', () => {
    const before = ticketOf({ awaiting: true, launchError: 'x' });
    const after = before.moveTo(State.DEV_REFINE, AT);
    expect(after.state).toBe(State.DEV_REFINE);
    expect(after.awaiting).toBe(false);
    expect(after.launchError).toBeNull();
    expect(before.state).toBe(State.REFINE);
    expect(before.awaiting).toBe(true);
  });

  it('完了にすると、完了日時が入る', () => {
    expect(ticketOf({ state: State.PRE_DONE_GATE }).moveTo(State.DONE, AT).doneAt).toBe(AT);
  });

  it('今の状態の担当でないロールは、操作できない。人間と自動は、制限しない', () => {
    const ticket = ticketOf({ state: State.REFINE });
    ticket.assertOperableBy(Actor.ofRole(Role.AC_REFINER));
    ticket.assertOperableBy(Actor.human());
    ticket.assertOperableBy(Actor.auto());
    expect(() => ticket.assertOperableBy(Actor.ofRole(Role.CODER))).toThrowError(/担当/);
  });

  it('依存が解消した TODO は、着手可', () => {
    const todo = ticketOf({ state: State.TODO });
    const done = ticketOf({ id: 2, state: State.DONE });
    const pending = ticketOf({ id: 3, state: State.IMPL });
    expect(todo.isReadyToStart([done])).toBe(true);
    expect(todo.isReadyToStart([done, pending])).toBe(false);
    expect(todo.isReadyToStart([])).toBe(false); // 依存が無いなら、「着手可」の知らせは要らない
    expect(ticketOf({ state: State.REFINE }).isReadyToStart([done])).toBe(false);
  });

  it('次の状態と、差し戻し先は、種別とデザインの要否で決まる', () => {
    const noDesign = ticketOf({ state: State.PRE_DESIGN_GATE, designNeeded: false });
    expect(noDesign.nextState()).toBe(State.FUNC_DESIGN);
    expect(ticketOf({ state: State.REVIEW }).defaultRollbackTarget()).toBe(State.IMPL);
  });
});

describe('Slug', () => {
  it('ASCII だけを残す。日本語だけなら、空', () => {
    expect(Slug.candidateFrom('Add Login Page!')).toBe('add-login-page');
    expect(Slug.candidateFrom('ログイン画面')).toBe('');
  });

  it('使える文字を判定する', () => {
    expect(Slug.isValid('feat/abc-123')).toBe(true);
    expect(Slug.isValid('日本語')).toBe(false);
    expect(Slug.isValid('-leading')).toBe(false);
  });
});
