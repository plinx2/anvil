import type { TicketDetail } from '@/api/ticket-detail';
import { StateBadge, TicketLink } from '@/components/common';

export function DependentsPanel({ detail }: { detail: TicketDetail }) {
  if (detail.dependents.length === 0) return null;

  return (
    <div>
      <div className="mb-1 text-xs text-muted-foreground">このチケットに依存</div>
      <ul className="divide-y">
        {detail.dependents.map((x) => (
          <li key={x.id} className="flex items-center gap-2 py-1">
            <TicketLink id={x.id} title={x.title} />
            <StateBadge state={x.state} />
          </li>
        ))}
      </ul>
    </div>
  );
}
