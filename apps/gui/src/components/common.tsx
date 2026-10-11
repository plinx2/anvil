import { State } from '@anvil/entity';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export const ago = (iso: string) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'たった今';
  if (m < 60) return `${m} 分前`;
  if (m < 1440) return `${Math.floor(m / 60)} 時間前`;
  return `${Math.floor(m / 1440)} 日前`;
};

export function StateBadge({ state }: { state: string }) {
  return <Badge variant="secondary">{State.of(state).label}</Badge>;
}

export function TicketLink({ id, title }: { id: number; title: string }) {
  return (
    <Link to={`/tickets/${id}`} className="text-primary hover:underline">
      T-{id} {title}
    </Link>
  );
}

export function Empty({ children = 'なし' }: { children?: React.ReactNode }) {
  return <div className="text-sm text-muted-foreground italic">{children}</div>;
}
