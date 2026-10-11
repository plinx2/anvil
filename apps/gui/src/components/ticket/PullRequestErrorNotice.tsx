import { rebuildPullRequest } from '@/api/actions/rebuild-pull-request';
import { useAct } from '@/api/use-act';
import { Button } from '@/components/ui/button';

export function PullRequestErrorNotice({ ticketId, message }: { ticketId: number; message: string }) {
  const act = useAct();

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gate-border bg-gate p-3 text-sm text-destructive">
      PR の作成に失敗した: {message}
      <Button size="sm" variant="outline" onClick={() => act.mutate(() => rebuildPullRequest(ticketId))}>
        PR を作り直す
      </Button>
    </div>
  );
}
