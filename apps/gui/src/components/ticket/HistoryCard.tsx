import type { TicketDetail } from '@/api/ticket-detail';
import { DiscardTicketButton } from '@/components/ticket/DiscardTicketButton';
import { LaunchHistoryList } from '@/components/ticket/LaunchHistoryList';
import { StateHistoryList } from '@/components/ticket/StateHistoryList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function HistoryCard({ detail }: { detail: TicketDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>履歴</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <StateHistoryList detail={detail} />
        <LaunchHistoryList detail={detail} />
        <div>
          <DiscardTicketButton ticketId={detail.ticket.id} />
        </div>
      </CardContent>
    </Card>
  );
}
