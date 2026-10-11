import { Link, useParams } from 'react-router-dom';
import { useTicket } from '@/api/queries/use-ticket';
import { DetailsCard } from '@/components/ticket/DetailsCard';
import { EntriesCard } from '@/components/ticket/EntriesCard';
import { HistoryCard } from '@/components/ticket/HistoryCard';
import { LaunchErrorNotice } from '@/components/ticket/LaunchErrorNotice';
import { OperationsCard } from '@/components/ticket/OperationsCard';
import { PullRequestErrorNotice } from '@/components/ticket/PullRequestErrorNotice';
import { TicketContentCard } from '@/components/ticket/TicketContentCard';
import { TicketHeader } from '@/components/ticket/TicketHeader';

export function TicketPage() {
  const id = Number(useParams().ticketId);
  const { data, error } = useTicket(id);
  const detail = data?.detail;

  if (error) return <p className="text-destructive">{error.message}</p>;
  if (!detail) return <p className="text-muted-foreground">読み込み中…</p>;

  return (
    <div className="grid gap-4">
      <TicketHeader detail={detail} />
      {detail.ticket.launchError && <LaunchErrorNotice message={detail.ticket.launchError} />}
      {detail.ticket.prError && <PullRequestErrorNotice ticketId={id} message={detail.ticket.prError} />}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="grid content-start gap-4">
          <TicketContentCard detail={detail} />
          <EntriesCard detail={detail} />
        </div>
        <div className="grid content-start gap-4">
          <OperationsCard detail={detail} />
          <DetailsCard detail={detail} />
          <HistoryCard detail={detail} />
        </div>
      </div>
      <Link to="/board" className="text-sm text-primary hover:underline">
        ← カンバンへ
      </Link>
    </div>
  );
}
