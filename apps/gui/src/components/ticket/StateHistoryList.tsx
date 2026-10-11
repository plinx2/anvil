import { Role, State } from '@anvil/entity';
import type { TicketDetail } from '@/api/ticket-detail';
import { ago } from '@/components/common';

type History = TicketDetail['history'][number];

const actorName = (actor: History['actor']) => {
  if (actor.kind === 'role') return Role.of(actor.role ?? '').label;
  return actor.kind === 'auto' ? 'anvil(自動)' : '人間';
};

export function StateHistoryList({ detail }: { detail: TicketDetail }) {
  return (
    <details>
      <summary className="cursor-pointer text-muted-foreground">状態の履歴({detail.history.length})</summary>
      <ul className="mt-1 divide-y">
        {detail.history.map((h) => (
          <li key={h.id} className="py-1">
            {h.fromState ? State.of(h.fromState).label : '起票'} → {State.of(h.toState).label}{' '}
            <span className="text-muted-foreground">
              {actorName(h.actor)} / {ago(h.createdAt)}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
