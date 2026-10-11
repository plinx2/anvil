import type { Dashboard } from '@/api/dashboard';
import { DashboardTicketList } from '@/components/dashboard/DashboardTicketList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function WorkingCard({ dashboard }: { dashboard: Dashboard }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>エージェント作業中({dashboard.working.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <DashboardTicketList rows={dashboard.working} />
      </CardContent>
    </Card>
  );
}
