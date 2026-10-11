import { setAutoGate } from '@/api/actions/set-auto-gate';
import type { TicketDetail } from '@/api/ticket-detail';
import { useAct } from '@/api/use-act';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export function AutoGateToggle({ detail }: { detail: TicketDetail }) {
  const t = detail.ticket;
  const act = useAct();

  return (
    <Label>
      <Checkbox checked={t.autoGate} onCheckedChange={(v) => act.mutate(() => setAutoGate(t.id, v === true))} />
      自動ゲート承認(実装前ゲート)
    </Label>
  );
}
