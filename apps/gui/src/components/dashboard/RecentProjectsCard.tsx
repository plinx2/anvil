import { Link } from 'react-router-dom';
import type { Dashboard } from '@/api/dashboard';
import { ago, Empty } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RecentProjectsCard({ dashboard }: { dashboard: Dashboard }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>最近変更があったプロジェクト</CardTitle>
      </CardHeader>
      <CardContent>
        {dashboard.recentProjects.length ? (
          <ul className="divide-y text-sm">
            {dashboard.recentProjects.map((p) => (
              <li key={p.id} className="flex items-baseline gap-2 py-1.5">
                <Link to={`/board/${p.id}`} className="text-primary hover:underline">
                  {p.name}
                </Link>
                <span className="text-muted-foreground">{ago(p.updatedAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>プロジェクトが無い(「プロジェクト」から登録する)</Empty>
        )}
      </CardContent>
    </Card>
  );
}
