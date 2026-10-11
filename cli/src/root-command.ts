import { defineCommand } from 'citty';
import type { CliDeps } from './cli-deps';
import { boardCommand } from './commands/board-command';
import { dashboardCommand } from './commands/dashboard-command';
import { intakeGroup } from './commands/intake-group';
import { projectGroup } from './commands/project-group';
import { reflectionGroup } from './commands/reflection-group';
import { repoGroup } from './commands/repo-group';
import { serveCommand } from './commands/serve-command';
import { ticketGroup } from './commands/ticket-group';

/** anvil コマンドの根。ここに載っているものだけが、使える。 */
export const rootCommand = (deps: CliDeps) =>
  defineCommand({
    meta: { name: 'anvil', description: 'AI 開発チームのチケット管理(サーバーを使わず、直接実行する)' },
    subCommands: {
      board: boardCommand(deps),
      dashboard: dashboardCommand(deps),
      intake: intakeGroup(deps),
      project: projectGroup(deps),
      reflection: reflectionGroup(deps),
      repo: repoGroup(deps),
      serve: serveCommand(deps),
      ticket: ticketGroup(deps),
    },
  });
