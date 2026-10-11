import type { ReactNode } from 'react';
import { Empty, StateBadge, TicketLink } from '@/components/common';

type Row = { id: number; title: string; project: string; state: string };

export function DashboardTicketList<R extends Row>({ rows, extra }: { rows: R[]; extra?: (row: R) => ReactNode }) {
  if (rows.length === 0) return <Empty />;

  return (
    <ul className="divide-y">
      {rows.map((row) => (
        <li key={row.id} className="flex flex-wrap items-baseline gap-2 py-1.5 text-sm">
          <TicketLink id={row.id} title={row.title} />
          <StateBadge state={row.state} />
          <span className="text-muted-foreground">{row.project}</span>
          {extra?.(row)}
        </li>
      ))}
    </ul>
  );
}
