import { defineCommand } from 'citty';
import type { CliDeps } from '../cli-deps';
import { intakeRequestCommand } from './intake-request-command';
import { intakeShowCommand } from './intake-show-command';

/** anvil intake — 起票の依頼のコマンドの群 */
export const intakeGroup = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'intake', description: '起票の依頼' },
    subCommands: {
      request: intakeRequestCommand(deps),
      show: intakeShowCommand(deps),
    },
  });
