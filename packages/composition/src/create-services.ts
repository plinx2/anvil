import {
  type AnvilService,
  DashboardService,
  FlagService,
  FlowService,
  IntakeService,
  ProjectService,
  ReflectionService,
  TicketService,
} from '@anvil/service';
import type { AnvilUseCases } from './create-use-cases';

/** ユースケースを、サービス(transport の入口)にまとめる。 */
export function createServices(u: AnvilUseCases): AnvilService {
  return {
    tickets: new TicketService(
      u.createTicket,
      u.updateTicket,
      u.discardTicket,
      u.addDependency,
      u.removeDependency,
      u.setAutoGate,
      u.addEntry,
      u.listEntries,
      u.getBoard,
      u.getTicketDetail,
    ),
    flow: new FlowService(
      u.startTicket,
      u.advanceTicket,
      u.rollbackTicket,
      u.passPreDesignGate,
      u.passPreImplGate,
      u.passPreDoneGate,
      u.startAgent,
      u.focusAgent,
      u.rebuildPullRequest,
    ),
    flags: new FlagService(u.askQuestion, u.answerQuestion),
    intakes: new IntakeService(u.requestIntake, u.getIntake),
    reflections: new ReflectionService(u.saveReflection, u.listReflections, u.decideReflection),
    projects: new ProjectService(u.createProject, u.deleteProject, u.addRepo, u.listProjects, u.getContextPages),
    dashboard: new DashboardService(u.getDashboard),
  };
}
