import { useState } from 'react';
import { addDependency } from '@/api/actions/add-dependency';
import { removeDependency } from '@/api/actions/remove-dependency';
import type { TicketDetail } from '@/api/ticket-detail';
import { useAct } from '@/api/use-act';
import { Empty, StateBadge, TicketLink } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function DependenciesPanel({ detail }: { detail: TicketDetail }) {
  const ticketId = detail.ticket.id;
  const act = useAct();
  const [dep, setDep] = useState('');

  return (
    <div>
      <div className="mb-1 text-xs text-muted-foreground">依存先</div>
      {detail.dependsOn.length ? (
        <ul className="divide-y">
          {detail.dependsOn.map((x) => (
            <li key={x.id} className="flex flex-wrap items-center gap-2 py-1">
              <TicketLink id={x.id} title={x.title} />
              <StateBadge state={x.state} />
              <Button size="sm" variant="ghost" onClick={() => act.mutate(() => removeDependency(ticketId, x.id))}>
                外す
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <Empty />
      )}
      <div className="mt-2 flex gap-2">
        <Input className="w-36" type="number" placeholder="依存先の番号" value={dep} onChange={(e) => setDep(e.target.value)} />
        <Button
          variant="outline"
          size="sm"
          disabled={!dep}
          onClick={() => act.mutate(() => addDependency(ticketId, Number(dep)), { onSuccess: () => setDep('') })}
        >
          依存を追加
        </Button>
      </div>
    </div>
  );
}
