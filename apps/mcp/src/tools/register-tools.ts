import type { AnvilService } from '@anvil/service';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpBinding } from '../mcp-binding';
import { registerAddDependencyTool } from './add-dependency-tool';
import { registerAddEntryTool } from './add-entry-tool';
import { registerAddRepoTool } from './add-repo-tool';
import { registerAdvanceTool } from './advance-tool';
import { registerAskTool } from './ask-tool';
import { registerBoardTool } from './board-tool';
import { registerCreateProjectTool } from './create-project-tool';
import { registerCreateTicketTool } from './create-ticket-tool';
import { registerDashboardTool } from './dashboard-tool';
import { registerDecideReflectionTool } from './decide-reflection-tool';
import { registerDeleteProjectTool } from './delete-project-tool';
import { registerDiscardTicketTool } from './discard-ticket-tool';
import { registerFocusAgentTool } from './focus-agent-tool';
import { registerGetContextPagesTool } from './get-context-pages-tool';
import { registerGetIntakeTool } from './get-intake-tool';
import { registerListProjectsTool } from './list-projects-tool';
import { registerListReflectionsTool } from './list-reflections-tool';
import { registerPassPreDesignGateTool } from './pass-pre-design-gate-tool';
import { registerPassPreDoneGateTool } from './pass-pre-done-gate-tool';
import { registerPassPreImplGateTool } from './pass-pre-impl-gate-tool';
import { registerReadEntriesTool } from './read-entries-tool';
import { registerReadTicketTool } from './read-ticket-tool';
import { registerRebuildPullRequestTool } from './rebuild-pull-request-tool';
import { registerRecordAnswerTool } from './record-answer-tool';
import { registerRemoveDependencyTool } from './remove-dependency-tool';
import { registerRequestIntakeTool } from './request-intake-tool';
import { registerRollbackTool } from './rollback-tool';
import { registerSaveReflectionTool } from './save-reflection-tool';
import { registerSetAutoGateTool } from './set-auto-gate-tool';
import { registerStartAgentTool } from './start-agent-tool';
import { registerStartTool } from './start-tool';
import { registerUpdateTicketTool } from './update-ticket-tool';

/** MCP のツールの一覧。ここに載っているものだけが、公開される。結びつきに応じて、出すツールが変わる。 */
export function registerTools(server: McpServer, service: AnvilService, binding: McpBinding): void {
  // 誰でも使える
  registerReadTicketTool(server, service, binding);
  registerReadEntriesTool(server, service, binding);
  registerAddEntryTool(server, service, binding);
  registerAskTool(server, service, binding);
  registerRecordAnswerTool(server, service, binding);
  registerAdvanceTool(server, service, binding);
  registerRollbackTool(server, service, binding);
  registerUpdateTicketTool(server, service, binding);
  registerAddDependencyTool(server, service, binding);
  registerBoardTool(server, service, binding);
  registerCreateTicketTool(server, service, binding);
  registerRequestIntakeTool(server, service, binding);

  if (binding.role) {
    // ロールのエージェントだけ
    registerSaveReflectionTool(server, service, binding);
  } else {
    // 人間が使う Claude だけ(ゲートの突破と回答は、GUI で行う)
    registerStartTool(server, service, binding);
    registerCreateProjectTool(server, service, binding);
    registerListProjectsTool(server, service, binding);
    registerAddRepoTool(server, service, binding);
    registerGetContextPagesTool(server, service, binding);
    registerDashboardTool(server, service, binding);
    registerDiscardTicketTool(server, service, binding);
    registerRemoveDependencyTool(server, service, binding);
    registerSetAutoGateTool(server, service, binding);
    registerPassPreDesignGateTool(server, service, binding);
    registerPassPreImplGateTool(server, service, binding);
    registerPassPreDoneGateTool(server, service, binding);
    registerStartAgentTool(server, service, binding);
    registerFocusAgentTool(server, service, binding);
    registerRebuildPullRequestTool(server, service, binding);
    registerGetIntakeTool(server, service, binding);
    registerListReflectionsTool(server, service, binding);
    registerDecideReflectionTool(server, service, binding);
    registerDeleteProjectTool(server, service, binding);
  }
}
