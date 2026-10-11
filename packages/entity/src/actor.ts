import { AnvilError } from './errors';
import { Role } from './role';

export type ActorKind = 'human' | 'role' | 'auto';

/** 操作する主体。人間、ロールのエージェント、anvil の自動(自動ゲート承認など)。 */
export class Actor {
  private static readonly HUMAN = new Actor('human', null);
  private static readonly AUTO = new Actor('auto', null);

  private constructor(
    readonly kind: ActorKind,
    readonly role: Role | null,
  ) {}

  static human(): Actor {
    return Actor.HUMAN;
  }

  static auto(): Actor {
    return Actor.AUTO;
  }

  static ofRole(role: Role): Actor {
    return new Actor('role', role);
  }

  /** 保存された形(kind と、ロールの id)から戻す。 */
  static restore(kind: string, roleId: string | null): Actor {
    if (kind === 'human') return Actor.HUMAN;
    if (kind === 'auto') return Actor.AUTO;
    if (kind === 'role' && roleId) return Actor.ofRole(Role.of(roleId));
    throw AnvilError.invalid(`操作の主体が不正: ${kind}`);
  }

  get isHuman(): boolean {
    return this.kind === 'human';
  }

  get isAuto(): boolean {
    return this.kind === 'auto';
  }

  get isRole(): boolean {
    return this.kind === 'role';
  }

  /** エントリの書き手のロール。人間が書いたエントリは 'human'。 */
  get entryRole(): string {
    return this.role?.id ?? 'human';
  }

  get label(): string {
    if (this.role) return this.role.label;
    return this.kind === 'auto' ? 'anvil(自動)' : '人間';
  }
}
