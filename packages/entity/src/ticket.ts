import type { Actor } from './actor';
import { AnvilError } from './errors';
import type { Kind } from './kind';
import type { Role } from './role';
import { State } from './state';
import type { TicketEdit } from './ticket-edit';
import type { TicketFlow } from './ticket-flow';

export interface TicketProps {
  readonly id: number;
  readonly projectId: number;
  readonly title: string;
  readonly body: string;
  readonly kind: Kind;
  readonly state: State;
  /** 承認待ちフラグ(途中の質問)。立っている間は、同じ状態で止まる */
  readonly awaiting: boolean;
  /** 自動ゲート承認フラグ。ON なら、実装前ゲートを判断なしで突破する */
  readonly autoGate: boolean;
  readonly sp: number | null;
  readonly designNeeded: boolean;
  /** ブランチ名になる */
  readonly slug: string;
  readonly targetRepos: readonly string[];
  /** リポジトリ名 → PR の URL */
  readonly prUrls: Readonly<Record<string, string>>;
  readonly prError: string | null;
  readonly launchError: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly doneAt: string | null;
}

/** 保存する前のチケット(番号は、保存する側が付ける) */
export type NewTicketProps = Omit<TicketProps, 'id'>;

/** チケット。状態の遷移、フラグ、編集は、新しいチケットを返す(元は変えない)。 */
export class Ticket {
  readonly id: number;
  readonly projectId: number;
  readonly title: string;
  readonly body: string;
  readonly kind: Kind;
  readonly state: State;
  readonly awaiting: boolean;
  readonly autoGate: boolean;
  readonly sp: number | null;
  readonly designNeeded: boolean;
  readonly slug: string;
  readonly targetRepos: readonly string[];
  readonly prUrls: Readonly<Record<string, string>>;
  readonly prError: string | null;
  readonly launchError: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly doneAt: string | null;

  constructor(props: TicketProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.title = props.title;
    this.body = props.body;
    this.kind = props.kind;
    this.state = props.state;
    this.awaiting = props.awaiting;
    this.autoGate = props.autoGate;
    this.sp = props.sp;
    this.designNeeded = props.designNeeded;
    this.slug = props.slug;
    this.targetRepos = props.targetRepos;
    this.prUrls = props.prUrls;
    this.prError = props.prError;
    this.launchError = props.launchError;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.doneAt = props.doneAt;
  }

  toProps(): TicketProps {
    return { ...this };
  }

  private changed(patch: Partial<TicketProps>): Ticket {
    return new Ticket({ ...this.toProps(), ...patch });
  }

  // ---------- 流れ ----------
  get flow(): TicketFlow {
    return { kind: this.kind, designNeeded: this.designNeeded };
  }

  get isGate(): boolean {
    return this.state.isGate;
  }

  get hasAgent(): boolean {
    return this.state.hasAgent;
  }

  get isDone(): boolean {
    return this.state === State.DONE;
  }

  nextState(): State {
    return this.state.next(this.flow);
  }

  defaultRollbackTarget(): State {
    return this.state.defaultRollbackTarget(this.flow);
  }

  assertCanRollbackTo(target: State): void {
    this.state.assertCanRollbackTo(target, this.flow);
  }

  /** 依存が解消した TODO は「着手可」(依存先が 1 つ以上あり、すべて完了している)。 */
  isReadyToStart(dependencies: readonly Ticket[]): boolean {
    return this.state === State.TODO && dependencies.length > 0 && dependencies.every((d) => d.isDone);
  }

  /** 今の状態の担当でないロールは、操作できない(人間と自動は、制限しない)。 */
  assertOperableBy(actor: Actor): void {
    if (!actor.isRole) return;
    if (this.state.role !== actor.role) {
      const owner: Role | null = this.state.role;
      throw AnvilError.forbidden(
        `今の状態(${this.state.label})の担当は ${owner ? owner.label : 'なし'}。${actor.role?.label}は操作できない`,
      );
    }
  }

  // ---------- 変更 ----------
  moveTo(state: State, at: string): Ticket {
    return this.changed({ state, awaiting: false, launchError: null, updatedAt: at, doneAt: state === State.DONE ? at : null });
  }

  raiseQuestion(at: string): Ticket {
    return this.changed({ awaiting: true, updatedAt: at });
  }

  answered(at: string): Ticket {
    return this.changed({ awaiting: false, updatedAt: at });
  }

  withSp(sp: number, at: string): Ticket {
    return this.changed({ sp, updatedAt: at });
  }

  withAutoGate(autoGate: boolean, at: string): Ticket {
    return this.changed({ autoGate, updatedAt: at });
  }

  withLaunchError(launchError: string | null): Ticket {
    return this.changed({ launchError });
  }

  withPullRequests(prUrls: Readonly<Record<string, string>>, prError: string | null): Ticket {
    return this.changed({ prUrls, prError });
  }

  edited(patch: TicketEdit, at: string): Ticket {
    return this.changed({ ...patch, updatedAt: at });
  }
}
