import type { DashboardService } from './services/dashboard-service';
import type { FlagService } from './services/flag-service';
import type { FlowService } from './services/flow-service';
import type { IntakeService } from './services/intake-service';
import type { ProjectService } from './services/project-service';
import type { ReflectionService } from './services/reflection-service';
import type { TicketService } from './services/ticket-service';

/** anvil が提供する機能の、すべての入口。transport(HTTP、MCP、コマンド)は、これを使う。 */
export interface AnvilService {
  readonly tickets: TicketService;
  readonly flow: FlowService;
  readonly flags: FlagService;
  readonly intakes: IntakeService;
  readonly reflections: ReflectionService;
  readonly projects: ProjectService;
  readonly dashboard: DashboardService;
}
