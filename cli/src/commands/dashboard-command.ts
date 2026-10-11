import { defineCommand } from 'citty';
import { type CliDeps, common, emit, guarded } from '../cli-deps';

/** anvil dashboard — ダッシュボード(承認待ち、ゲートにあるチケット、着手可など) */
export const dashboardCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'dashboard', description: 'ダッシュボード(承認待ち、ゲートにあるチケット、着手可など)' },
    args: {
      ...common,
    },
    run: ({ args }) =>
      guarded(deps, async () => {
        emit(deps, args, await deps.service.dashboard.show(deps.ctx, {}));
      }),
  });
