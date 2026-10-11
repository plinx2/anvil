import type { Ticket } from '@anvil/entity';
import type { FindTicket } from '../find/find-ticket';
import type { EntryStore, PullRequestPort, RepoStore, TicketStore } from '../ports';
import type { RequestContext } from '../request-context';
import type { UseCase } from '../use-case';

const MATERIAL_LIMIT = 60000;

export interface EnsurePullRequestInput {
  ticketId: number;
}

export type EnsurePullRequestOutput = Record<string, never>;

/**
 * 完了前ゲートに到達したチケットの PR を、作る(既にあれば更新する)。
 * リモートがあるリポジトリだけ。スパイクは対象外。失敗は、チケットに残す(完了前ゲートへの到達は止めない)。
 */
export class EnsurePullRequest implements UseCase<EnsurePullRequestInput, EnsurePullRequestOutput> {
  constructor(
    private readonly tickets: TicketStore,
    private readonly repos: RepoStore,
    private readonly entries: EntryStore,
    private readonly pullRequests: PullRequestPort,
    private readonly findTicket: FindTicket,
  ) {}

  async execute(ctx: RequestContext, input: EnsurePullRequestInput): Promise<EnsurePullRequestOutput> {
    const { ticket } = await this.findTicket.execute(ctx, { ticketId: input.ticketId });
    if (ticket.kind.isSpike) return {};
    const repos = (await this.repos.listByProject(ctx, ticket.projectId)).filter((r) => ticket.targetRepos.includes(r.name) && r.hasRemote);
    if (repos.length === 0) return {};

    const material = await this.materialOf(ctx, ticket);
    const urls: Record<string, string> = { ...ticket.prUrls };
    const errors: string[] = [];
    for (const repo of repos) {
      try {
        urls[repo.name] = await this.pullRequests.createOrUpdate(ctx, {
          repoPath: repo.path,
          repoName: repo.name,
          branch: ticket.slug,
          base: repo.defaultBranch,
          title: ticket.title,
          material,
          existingUrl: urls[repo.name],
        });
      } catch (e) {
        errors.push(`${repo.name}: ${(e as Error).message}`);
      }
    }
    const { ticket: latest } = await this.findTicket.execute(ctx, { ticketId: input.ticketId });
    await this.tickets.save(ctx, latest.withPullRequests(urls, errors.length > 0 ? errors.join(' / ') : null));
    return {};
  }

  /** 本文の材料: タイトル、内容、すべてのエントリ */
  private async materialOf(ctx: RequestContext, ticket: Ticket): Promise<string> {
    const entries = await this.entries.list(ctx, ticket.id);
    const sections = entries.map((e) => `## [${e.state.label} / ${e.role}]\n${e.body}`);
    return [`# ${ticket.title}`, ticket.body, ...sections].join('\n\n').slice(0, MATERIAL_LIMIT);
  }
}
