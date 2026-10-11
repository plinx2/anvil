import type { AnvilService } from '@anvil/service';
import type { HttpApp } from '../http-app';
import { registerGetDashboard } from './dashboard/get-dashboard';
import { registerAnswerQuestion } from './flag/answer-question';
import { registerAskQuestion } from './flag/ask-question';
import { registerAdvanceTicket } from './flow/advance-ticket';
import { registerFocusAgent } from './flow/focus-agent';
import { registerPassPreDesignGate } from './flow/pass-pre-design-gate';
import { registerPassPreDoneGate } from './flow/pass-pre-done-gate';
import { registerPassPreImplGate } from './flow/pass-pre-impl-gate';
import { registerRebuildPullRequest } from './flow/rebuild-pull-request';
import { registerRollbackTicket } from './flow/rollback-ticket';
import { registerStartAgent } from './flow/start-agent';
import { registerStartTicket } from './flow/start-ticket';
import { registerGetIntake } from './intake/get-intake';
import { registerRequestIntake } from './intake/request-intake';
import { registerAddRepo } from './project/add-repo';
import { registerCreateProject } from './project/create-project';
import { registerDeleteProject } from './project/delete-project';
import { registerGetContextPages } from './project/get-context-pages';
import { registerListProjects } from './project/list-projects';
import { registerDecideReflection } from './reflection/decide-reflection';
import { registerListReflections } from './reflection/list-reflections';
import { registerAddDependency } from './ticket/add-dependency';
import { registerAddEntry } from './ticket/add-entry';
import { registerCreateTicket } from './ticket/create-ticket';
import { registerDiscardTicket } from './ticket/discard-ticket';
import { registerGetBoard } from './ticket/get-board';
import { registerGetTicketDetail } from './ticket/get-ticket-detail';
import { registerListEntries } from './ticket/list-entries';
import { registerRemoveDependency } from './ticket/remove-dependency';
import { registerSetAutoGate } from './ticket/set-auto-gate';
import { registerUpdateTicket } from './ticket/update-ticket';

/** HTTP API の入り口の一覧。ここに載っているものだけが、公開される。 */
export function registerRoutes(app: HttpApp, service: AnvilService): void {
  // ダッシュボード
  registerGetDashboard(app, service);

  // チケット
  registerGetBoard(app, service);
  registerCreateTicket(app, service);
  registerGetTicketDetail(app, service);
  registerUpdateTicket(app, service);
  registerDiscardTicket(app, service);
  registerAddDependency(app, service);
  registerRemoveDependency(app, service);
  registerSetAutoGate(app, service);
  registerAddEntry(app, service);
  registerListEntries(app, service);

  // 状態の流れ
  registerStartTicket(app, service);
  registerAdvanceTicket(app, service);
  registerRollbackTicket(app, service);
  registerPassPreDesignGate(app, service);
  registerPassPreImplGate(app, service);
  registerPassPreDoneGate(app, service);
  registerStartAgent(app, service);
  registerFocusAgent(app, service);
  registerRebuildPullRequest(app, service);

  // 承認待ちフラグ
  registerAskQuestion(app, service);
  registerAnswerQuestion(app, service);

  // 起票の依頼
  registerRequestIntake(app, service);
  registerGetIntake(app, service);

  // 振り返り
  registerListReflections(app, service);
  registerDecideReflection(app, service);

  // プロジェクト
  registerListProjects(app, service);
  registerCreateProject(app, service);
  registerDeleteProject(app, service);
  registerAddRepo(app, service);
  registerGetContextPages(app, service);
}
