import type { Dashboard } from '@/api/dashboard';
import { ago } from '@/components/common';
import { DashboardTicketList } from '@/components/dashboard/DashboardTicketList';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AwaitingCard({ dashboard }: { dashboard: Dashboard }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>承認待ち({dashboard.awaiting.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <DashboardTicketList rows={dashboard.awaiting} extra={(row) => <Badge variant="warn">待ち {ago(row.since)}</Badge>} />
      </CardContent>
    </Card>
  );
}
