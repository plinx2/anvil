import type { TicketDetail } from '@/api/ticket-detail';
import { DependenciesPanel } from '@/components/ticket/DependenciesPanel';
import { DependentsPanel } from '@/components/ticket/DependentsPanel';
import { TicketFacts } from '@/components/ticket/TicketFacts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DetailsCard({ detail }: { detail: TicketDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>詳細</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <TicketFacts detail={detail} />
        <DependenciesPanel detail={detail} />
        <DependentsPanel detail={detail} />
      </CardContent>
    </Card>
  );
}
