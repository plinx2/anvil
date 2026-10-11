import type { TicketDetail } from '@/api/ticket-detail';
import { Empty } from '@/components/common';
import { AppendEntryForm } from '@/components/ticket/AppendEntryForm';
import { EntryItem } from '@/components/ticket/EntryItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function EntriesCard({ detail }: { detail: TicketDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>エントリ({detail.entries.length} 件)</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {detail.entries.length ? (
          <div className="divide-y">
            {[...detail.entries].reverse().map((entry) => (
              <EntryItem key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <Empty>まだ無い</Empty>
        )}
        <AppendEntryForm ticketId={detail.ticket.id} />
      </CardContent>
    </Card>
  );
}
