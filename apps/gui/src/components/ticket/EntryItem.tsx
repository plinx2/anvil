import { Role, State } from '@anvil/entity';
import type { TicketDetail } from '@/api/ticket-detail';
import { ago } from '@/components/common';
import { cn } from '@/lib/utils';

type Entry = TicketDetail['entries'][number];

const roleName = (role: string) => (role === 'human' ? '人間' : (Role.find(role)?.label ?? role));

export function EntryItem({ entry }: { entry: Entry }) {
  return (
    <div className={cn('py-2', entry.authorKind === 'human' && 'border-l-[3px] border-primary pl-3')}>
      <div className="text-xs text-muted-foreground">
        {State.of(entry.state).label} / {roleName(entry.role)} / {ago(entry.createdAt)}
      </div>
      <pre className="mt-1 whitespace-pre-wrap break-words font-sans text-sm">{entry.body}</pre>
    </div>
  );
}
