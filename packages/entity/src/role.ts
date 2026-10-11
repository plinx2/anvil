import { AnvilError } from './errors';
import { ModelTier } from './model-tier';

interface RoleSettings {
  /** 起票の依頼(分割・スパイク)ができる。DEV リファインまでのロール(確定) */
  canRequestIntake?: boolean;
  /** herdr のペインを使わず、anvil が内部で動かすロール */
  background?: boolean;
  /** モデルの段階。既定は standard。軽い仕事だけ light */
  modelTier?: ModelTier;
}

/** チーム内のロール。 */
export class Role {
  static readonly PBI_AUTHOR = new Role('pbi_author', 'PBI 起票担当', {});
  static readonly AC_REFINER = new Role('ac_refiner', 'AC 担当', { canRequestIntake: true });
  static readonly IMPL_PLANNER = new Role('impl_planner', '実装方針担当', { canRequestIntake: true });
  static readonly UI_DESIGNER = new Role('ui_designer', 'デザイン設計担当', {});
  static readonly FUNC_DESIGNER = new Role('func_designer', '機能設計担当', {});
  static readonly QA = new Role('qa', 'QA/QE', {});
  static readonly CODER = new Role('coder', 'コーダー', {});
  static readonly FUNC_VERIFIER = new Role('func_verifier', '機能動作確認担当', {});
  static readonly UI_VERIFIER = new Role('ui_verifier', 'デザイン確認担当', {});
  static readonly REVIEWER = new Role('reviewer', 'レビュワー', {});
  static readonly PR_WRITER = new Role('pr_writer', 'PR 作成担当', { background: true, modelTier: ModelTier.LIGHT });

  static readonly all: readonly Role[] = [
    Role.PBI_AUTHOR,
    Role.AC_REFINER,
    Role.IMPL_PLANNER,
    Role.UI_DESIGNER,
    Role.FUNC_DESIGNER,
    Role.QA,
    Role.CODER,
    Role.FUNC_VERIFIER,
    Role.UI_VERIFIER,
    Role.REVIEWER,
    Role.PR_WRITER,
  ];

  readonly canRequestIntake: boolean;
  readonly isBackground: boolean;
  readonly modelTier: ModelTier;

  private constructor(
    readonly id: string,
    readonly label: string,
    settings: RoleSettings,
  ) {
    this.canRequestIntake = settings.canRequestIntake ?? false;
    this.isBackground = settings.background ?? false;
    this.modelTier = settings.modelTier ?? ModelTier.STANDARD;
  }

  static of(id: string): Role {
    const found = Role.all.find((r) => r.id === id);
    if (!found) throw AnvilError.invalid(`ロールが不正: ${id}`);
    return found;
  }

  static find(id: string): Role | undefined {
    return Role.all.find((r) => r.id === id);
  }
}
