import type { State } from '@anvil/entity';
import type { BoardTicket } from '@/api/board-ticket';
import { BoardCard } from '@/components/board/BoardCard';
import { cn } from '@/lib/utils';

export function BoardColumn({ state, tickets }: { state: State; tickets: BoardTicket[] }) {
  const gate = state.isGate;

  return (
    <section className={cn('w-52 shrink-0 rounded-xl p-2', gate ? 'border border-dashed border-gate-border bg-gate' : 'bg-secondary')}>
      <div className="text-[11px] text-muted-foreground">
        {state.category.label}
        {gate && '・ゲート'}
      </div>
      <h2 className="mb-2 flex justify-between text-sm font-semibold">
        {state.label}
        <span className="text-muted-foreground">{tickets.length}</span>
      </h2>
      <div className="grid gap-2">
        {tickets.map((t) => (
          <BoardCard key={t.id} ticket={t} />
        ))}
      </div>
    </section>
  );
}
