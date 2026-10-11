import { State } from '@anvil/entity';
import { Link } from 'react-router-dom';
import type { BoardTicket } from '@/api/board-ticket';
import { Badge } from '@/components/ui/badge';

export function BoardCard({ ticket }: { ticket: BoardTicket }) {
  const t = ticket;

  return (
    <Link to={`/tickets/${t.id}`} className="block rounded-lg border bg-card p-2 text-sm hover:border-primary">
      <div>
        <span className="text-xs text-muted-foreground">T-{t.id} </span>
        {t.title}
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {t.kind === 'spike' && <Badge>スパイク</Badge>}
        {t.awaiting && <Badge variant="warn">承認待ち</Badge>}
        {t.agentActive && !t.awaiting && <Badge variant="default">作業中</Badge>}
        {t.ready && <Badge variant="ok">着手可</Badge>}
        {t.unmet.length > 0 && <Badge>依存待ち {t.unmet.map((i) => `T-${i}`).join(',')}</Badge>}
        {(t.prError || t.launchError) && <Badge variant="destructive">要対応</Badge>}
        {State.of(t.state).hasAgent && !t.agentActive && !t.awaiting && t.unmet.length === 0 && <Badge variant="outline">担当なし</Badge>}
      </div>
    </Link>
  );
}
