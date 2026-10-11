import type { Dashboard } from '@/api/dashboard';
import { DashboardTicketList } from '@/components/dashboard/DashboardTicketList';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function GatesCard({ dashboard }: { dashboard: Dashboard }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ゲートにあるチケット({dashboard.gates.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <DashboardTicketList rows={dashboard.gates} extra={(row) => row.ready && <Badge variant="ok">着手可</Badge>} />
      </CardContent>
    </Card>
  );
}
