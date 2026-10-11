import type { TicketDetail } from '@/api/ticket-detail';
import { StateBadge } from '@/components/common';
import { Badge } from '@/components/ui/badge';

export function TicketHeader({ detail }: { detail: TicketDetail }) {
  const t = detail.ticket;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <h1 className="text-xl font-semibold">
        T-{t.id} {t.title}
      </h1>
      <StateBadge state={t.state} />
      {t.kind === 'spike' && <Badge>スパイク</Badge>}
      {t.isGate && <Badge variant="warn">ゲート</Badge>}
      {t.ready && <Badge variant="ok">着手可</Badge>}
    </div>
  );
}
