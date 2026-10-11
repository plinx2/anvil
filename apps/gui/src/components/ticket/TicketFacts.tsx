import type { TicketDetail } from '@/api/ticket-detail';
import { PullRequestLinks } from '@/components/ticket/PullRequestLinks';

export function TicketFacts({ detail }: { detail: TicketDetail }) {
  const t = detail.ticket;

  return (
    <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
      <dt className="text-muted-foreground">プロジェクト</dt>
      <dd>{t.project}</dd>
      <dt className="text-muted-foreground">slug</dt>
      <dd>{t.slug}</dd>
      <dt className="text-muted-foreground">SP</dt>
      <dd>{t.sp ?? '未設定'}</dd>
      <dt className="text-muted-foreground">デザイン</dt>
      <dd>{t.designNeeded ? '要' : '不要'}</dd>
      <dt className="text-muted-foreground">対象リポジトリ</dt>
      <dd>{t.targetRepos.join(', ') || '未設定'}</dd>
      <dt className="text-muted-foreground">ブランチ</dt>
      <dd>{detail.branches.map((b) => `${b.repoName}:${b.branch}`).join(', ') || 'まだ切っていない'}</dd>
      <dt className="text-muted-foreground">PR</dt>
      <dd>
        <PullRequestLinks prUrls={t.prUrls} />
      </dd>
      <dt className="text-muted-foreground">差し戻し</dt>
      <dd>{t.rollbacks} 回</dd>
    </dl>
  );
}
