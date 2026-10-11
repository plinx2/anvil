import { Category } from './category';
import { AnvilError } from './errors';
import { Kind } from './kind';
import { Role } from './role';
import type { TicketFlow } from './ticket-flow';

/**
 * チケットの状態。状態に関する知識(ラベル、カテゴリ、担当、ゲートか、次の状態、差し戻し先)は、すべてここにある。
 * 1 つの状態に 1 つのロール。ゲートと TODO と完了には、ロールがいない(エージェントがいない)。
 */
export class State {
  static readonly TODO = new State('todo', 'TODO', Category.BEFORE, null, true);
  static readonly REFINE = new State('refine', 'リファイン', Category.REFINE, Role.AC_REFINER, false);
  static readonly DEV_REFINE = new State('dev_refine', 'DEV リファイン', Category.REFINE, Role.IMPL_PLANNER, false);
  static readonly PRE_DESIGN_GATE = new State('pre_design_gate', '設計前ゲート', Category.REFINE, null, true);
  static readonly UI_DESIGN = new State('ui_design', 'デザイン設計', Category.DESIGN, Role.UI_DESIGNER, false);
  static readonly FUNC_DESIGN = new State('func_design', '機能設計', Category.DESIGN, Role.FUNC_DESIGNER, false);
  static readonly TEST_DESIGN = new State('test_design', 'テスト設計', Category.DESIGN, Role.QA, false);
  static readonly PRE_IMPL_GATE = new State('pre_impl_gate', '実装前ゲート', Category.DESIGN, null, true);
  static readonly IMPL = new State('impl', '実装', Category.IMPLEMENT, Role.CODER, false);
  static readonly FUNC_VERIFY = new State('func_verify', '機能動作確認', Category.IMPLEMENT, Role.FUNC_VERIFIER, false);
  static readonly UI_VERIFY = new State('ui_verify', 'デザイン確認', Category.IMPLEMENT, Role.UI_VERIFIER, false);
  static readonly REVIEW = new State('review', 'レビュー', Category.IMPLEMENT, Role.REVIEWER, false);
  static readonly PRE_DONE_GATE = new State('pre_done_gate', '完了前ゲート', Category.IMPLEMENT, null, true);
  static readonly DONE = new State('done', '完了', Category.DONE, null, false);

  /** 標準の流れの順 */
  static readonly all: readonly State[] = [
    State.TODO,
    State.REFINE,
    State.DEV_REFINE,
    State.PRE_DESIGN_GATE,
    State.UI_DESIGN,
    State.FUNC_DESIGN,
    State.TEST_DESIGN,
    State.PRE_IMPL_GATE,
    State.IMPL,
    State.FUNC_VERIFY,
    State.UI_VERIFY,
    State.REVIEW,
    State.PRE_DONE_GATE,
    State.DONE,
  ];

  private constructor(
    readonly id: string,
    readonly label: string,
    readonly category: Category,
    /** この状態の担当。ゲート、TODO、完了は null */
    readonly role: Role | null,
    /** 人間が突破する関所(TODO はそれ自体がゲート) */
    readonly isGate: boolean,
  ) {}

  get hasAgent(): boolean {
    return this.role !== null;
  }

  static of(id: string): State {
    const found = State.all.find((s) => s.id === id);
    if (!found) throw AnvilError.invalid(`状態が不正: ${id}`);
    return found;
  }

  /** 起票できる状態。スパイクは、実装前ゲートで生まれる。 */
  static initialStatesFor(kind: Kind): State[] {
    return kind.isSpike ? [State.PRE_IMPL_GATE] : State.all.filter((s) => s !== State.DONE);
  }

  private get order(): number {
    return State.all.indexOf(this);
  }

  isBefore(other: State): boolean {
    return this.order < other.order;
  }

  /** この流れでは通らない状態か(スパイクの機能設計は、差し戻されたときだけ通る)。 */
  isSkippedFor(flow: TicketFlow): boolean {
    if (!flow.designNeeded && (this === State.UI_DESIGN || this === State.UI_VERIFY)) return true;
    if (flow.kind === Kind.SPIKE) {
      const spikeStates: readonly State[] = [State.PRE_IMPL_GATE, State.IMPL, State.PRE_DONE_GATE, State.DONE, State.FUNC_DESIGN];
      return !spikeStates.includes(this);
    }
    return false;
  }

  /** 次の状態(進める、ゲートを突破する)。 */
  next(flow: TicketFlow): State {
    if (this === State.DONE) throw AnvilError.invalid('完了のチケットは進められない');
    if (flow.kind === Kind.SPIKE && this === State.FUNC_DESIGN) return State.PRE_IMPL_GATE;
    const following = State.all.slice(this.order + 1).find((s) => !s.isSkippedFor(flow));
    if (!following) throw AnvilError.invalid(`次の状態が無い: ${this.label}`);
    return following;
  }

  /** 差し戻しの既定の戻り先: カテゴリ内の最初の状態(スキップされる状態は飛ばす)。 */
  defaultRollbackTarget(flow: TicketFlow): State {
    if (flow.kind === Kind.SPIKE && this.category === Category.DESIGN) return State.FUNC_DESIGN;
    const first = State.all.find((s) => s.category === this.category && !s.isSkippedFor(flow));
    if (!first) throw AnvilError.invalid(`戻り先が決まらない: ${this.label}`);
    return first;
  }

  /** 後ろへはどこまでも戻せる。前へは戻せない。 */
  assertCanRollbackTo(target: State, flow: TicketFlow): void {
    if (!target.isBefore(this)) throw AnvilError.invalid('戻り先は、今の状態より前でなければならない');
    if (target === State.TODO) throw AnvilError.invalid('TODO へは戻せない');
    if (flow.kind === Kind.SPIKE && target !== State.FUNC_DESIGN && target !== State.IMPL) {
      throw AnvilError.invalid('スパイクの戻り先は、機能設計か実装');
    }
    if (!flow.designNeeded && (target === State.UI_DESIGN || target === State.UI_VERIFY)) {
      throw AnvilError.invalid('デザイン不要のチケットは、デザインの状態へ戻せない');
    }
  }
}
