import { describe, expect, it } from 'vitest';
import { Category, Kind, Role, State, type TicketFlow } from '../src';

const standard: TicketFlow = { kind: Kind.STANDARD, designNeeded: true };
const noDesign: TicketFlow = { kind: Kind.STANDARD, designNeeded: false };
const spike: TicketFlow = { kind: Kind.SPIKE, designNeeded: false };

describe('State は、状態に関する知識を持つ', () => {
  it('ラベル、カテゴリ、担当、ゲートか、が、状態から分かる', () => {
    expect(State.PRE_DESIGN_GATE.label).toBe('設計前ゲート');
    expect(State.PRE_DESIGN_GATE.category).toBe(Category.REFINE);
    expect(State.PRE_DESIGN_GATE.isGate).toBe(true);
    expect(State.PRE_DESIGN_GATE.hasAgent).toBe(false);

    expect(State.REVIEW.role).toBe(Role.REVIEWER);
    expect(State.REVIEW.hasAgent).toBe(true);
    // TODO はそれ自体がゲート。完了は、ゲートではない
    expect(State.TODO.isGate).toBe(true);
    expect(State.DONE.isGate).toBe(false);
  });

  it('識別子から探せる。不正な識別子はエラー', () => {
    expect(State.of('impl')).toBe(State.IMPL);
    expect(() => State.of('nothing')).toThrow(/状態が不正/);
  });

  it('標準の流れ: すべての状態を通る', () => {
    const order: State[] = [State.TODO];
    while (order.at(-1) !== State.DONE) order.push((order.at(-1) as State).next(standard));
    expect(order.map((s) => s.id)).toEqual([
      'todo',
      'refine',
      'dev_refine',
      'pre_design_gate',
      'ui_design',
      'func_design',
      'test_design',
      'pre_impl_gate',
      'impl',
      'func_verify',
      'ui_verify',
      'review',
      'pre_done_gate',
      'done',
    ]);
  });

  it('デザイン不要: デザイン設計とデザイン確認を飛ばす', () => {
    expect(State.PRE_DESIGN_GATE.next(noDesign)).toBe(State.FUNC_DESIGN);
    expect(State.FUNC_VERIFY.next(noDesign)).toBe(State.REVIEW);
  });

  it('スパイク: 実装前ゲート → 実装 → 完了前ゲート → 完了(機能設計は、差し戻されたときだけ)', () => {
    expect(State.PRE_IMPL_GATE.next(spike)).toBe(State.IMPL);
    expect(State.IMPL.next(spike)).toBe(State.PRE_DONE_GATE);
    expect(State.PRE_DONE_GATE.next(spike)).toBe(State.DONE);
    expect(State.FUNC_DESIGN.next(spike)).toBe(State.PRE_IMPL_GATE);
    expect(State.initialStatesFor(Kind.SPIKE)).toEqual([State.PRE_IMPL_GATE]);
  });

  it('完了のチケットは進められない', () => {
    expect(() => State.DONE.next(standard)).toThrow();
  });
});

describe('差し戻し', () => {
  it('既定の戻り先は、カテゴリ内の最初の状態', () => {
    expect(State.REVIEW.defaultRollbackTarget(standard)).toBe(State.IMPL);
    expect(State.PRE_DONE_GATE.defaultRollbackTarget(standard)).toBe(State.IMPL);
    expect(State.TEST_DESIGN.defaultRollbackTarget(standard)).toBe(State.UI_DESIGN);
    expect(State.PRE_IMPL_GATE.defaultRollbackTarget(standard)).toBe(State.UI_DESIGN);
    expect(State.PRE_IMPL_GATE.defaultRollbackTarget(noDesign)).toBe(State.FUNC_DESIGN);
    expect(State.PRE_DESIGN_GATE.defaultRollbackTarget(standard)).toBe(State.REFINE);
    expect(State.DEV_REFINE.defaultRollbackTarget(standard)).toBe(State.REFINE);
    expect(State.PRE_DONE_GATE.defaultRollbackTarget(spike)).toBe(State.IMPL);
    expect(State.PRE_IMPL_GATE.defaultRollbackTarget(spike)).toBe(State.FUNC_DESIGN);
  });

  it('戻り先は、今より前の状態だけ', () => {
    State.REVIEW.assertCanRollbackTo(State.REFINE, standard);
    expect(() => State.REVIEW.assertCanRollbackTo(State.REVIEW, standard)).toThrow();
    expect(() => State.REFINE.assertCanRollbackTo(State.REVIEW, standard)).toThrow();
    expect(() => State.REFINE.assertCanRollbackTo(State.TODO, standard)).toThrow();
    expect(() => State.REVIEW.assertCanRollbackTo(State.UI_DESIGN, noDesign)).toThrow();
    expect(() => State.PRE_DONE_GATE.assertCanRollbackTo(State.REFINE, spike)).toThrow();
  });
});

describe('Role は、設定を持つ', () => {
  it('起票の依頼ができるのは、DEV リファインまでのロール', () => {
    expect(Role.all.filter((r) => r.canRequestIntake)).toEqual([Role.AC_REFINER, Role.IMPL_PLANNER]);
  });

  it('モデルは、基本は standard。背景ロールの PR 作成担当だけ light', () => {
    expect(Role.all.filter((r) => r.modelTier.id === 'light')).toEqual([Role.PR_WRITER]);
    expect(Role.PR_WRITER.isBackground).toBe(true);
  });
});
