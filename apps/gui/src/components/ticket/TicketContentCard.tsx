import { useState } from 'react';
import type { TicketDetail } from '@/api/ticket-detail';
import { TicketEditForm } from '@/components/ticket/TicketEditForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TicketContentCard({ detail }: { detail: TicketDetail }) {
  const [editing, setEditing] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>内容</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <pre className="whitespace-pre-wrap rounded-md bg-secondary p-3 font-sans text-sm">{detail.ticket.body || '(内容なし)'}</pre>
        {editing ? (
          <TicketEditForm detail={detail} onClose={() => setEditing(false)} />
        ) : (
          <div>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              編集
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
