import type { TicketDetail } from '@/api/ticket-detail';
import { AnswerPanel } from '@/components/ticket/AnswerPanel';
import { AutoGateToggle } from '@/components/ticket/AutoGateToggle';
import { RollbackPanel } from '@/components/ticket/RollbackPanel';
import { StateActions } from '@/components/ticket/StateActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function OperationsCard({ detail }: { detail: TicketDetail }) {
  const t = detail.ticket;

  return (
    <Card>
      <CardHeader>
        <CardTitle>操作</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {t.awaiting && <AnswerPanel ticketId={t.id} />}
        <StateActions detail={detail} />
        {t.state !== 'todo' && t.state !== 'done' && <RollbackPanel detail={detail} />}
        <AutoGateToggle detail={detail} />
      </CardContent>
    </Card>
  );
}
