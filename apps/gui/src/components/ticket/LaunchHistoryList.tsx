import { Role, State } from '@anvil/entity';
import type { TicketDetail } from '@/api/ticket-detail';
import { ago } from '@/components/common';

export function LaunchHistoryList({ detail }: { detail: TicketDetail }) {
  return (
    <details>
      <summary className="cursor-pointer text-muted-foreground">エージェントの起動({detail.launches.length})</summary>
      <ul className="mt-1 divide-y">
        {detail.launches.map((l) => (
          <li key={l.id} className="py-1">
            {l.state ? State.of(l.state).label : '起票'} / {Role.of(l.role).label}{' '}
            <span className="text-muted-foreground">
              session {String(l.sessionId).slice(0, 8)} / {ago(l.startedAt)} → {l.endedAt ? '終了' : '稼働中'}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
