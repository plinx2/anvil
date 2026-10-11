import { State } from '@anvil/entity';
import { useState } from 'react';
import { rollbackTicket } from '@/api/actions/rollback-ticket';
import type { TicketDetail } from '@/api/ticket-detail';
import { useAct } from '@/api/use-act';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function RollbackPanel({ detail }: { detail: TicketDetail }) {
  const t = detail.ticket;
  const act = useAct();
  const current = State.of(t.state);
  const [target, setTarget] = useState('default');
  const [reason, setReason] = useState('');

  return (
    <details>
      <summary className="cursor-pointer text-sm text-muted-foreground">差し戻し</summary>
      <div className="mt-2 grid gap-2">
        <Select value={target} onValueChange={setTarget}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">戻り先: 既定(カテゴリの最初)</SelectItem>
            {State.all
              .filter((s) => s.isBefore(current) && s !== State.TODO)
              .map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Textarea placeholder="差し戻しの理由(必須。必ず直すものだけを書く)" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div>
          <Button
            variant="destructive"
            disabled={!reason.trim()}
            onClick={() =>
              act.mutate(() => rollbackTicket(t.id, reason, target === 'default' ? undefined : target), { onSuccess: () => setReason('') })
            }
          >
            差し戻す
          </Button>
        </div>
      </div>
    </details>
  );
}
