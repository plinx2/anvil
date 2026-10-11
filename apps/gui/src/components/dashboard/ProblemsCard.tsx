import type { Dashboard } from '@/api/dashboard';
import { TicketLink } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ProblemsCard({ dashboard }: { dashboard: Dashboard }) {
  if (dashboard.problems.length === 0) return null;

  return (
    <Card className="border-gate-border bg-gate">
      <CardHeader>
        <CardTitle>要対応</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y text-sm">
          {dashboard.problems.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-2 py-1.5">
              <TicketLink id={p.id} title={p.title} />
              {p.prError && <Badge variant="destructive">PR 作成失敗: {p.prError}</Badge>}
              {p.launchError && <Badge variant="destructive">{p.launchError}</Badge>}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
