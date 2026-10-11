import { useNavigate } from 'react-router-dom';
import { discardTicket } from '@/api/actions/discard-ticket';
import { useAct } from '@/api/use-act';
import { Button } from '@/components/ui/button';

export function DiscardTicketButton({ ticketId }: { ticketId: number }) {
  const act = useAct();
  const navigate = useNavigate();

  const discard = () => {
    if (!confirm('このチケットを破棄(削除)する。ブランチとワークツリーは残す。')) return;
    act.mutate(() => discardTicket(ticketId), { onSuccess: () => navigate('/board') });
  };

  return (
    <Button variant="destructive" size="sm" onClick={discard}>
      チケットを破棄
    </Button>
  );
}
