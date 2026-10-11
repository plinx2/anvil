import type { Dashboard } from '@/api/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const versusLastYear = (count: number, lastYear: number) => `昨対 ${lastYear}(${count - lastYear >= 0 ? '+' : ''}${count - lastYear})`;

export function DoneCountCard({ dashboard }: { dashboard: Dashboard }) {
  const { doneWeek, doneMonth } = dashboard;

  return (
    <Card>
      <CardHeader>
        <CardTitle>完了チケット数</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-8">
        <div>
          <div className="text-3xl font-bold">{doneWeek.count}</div>
          <div className="text-xs text-muted-foreground">過去 1 週間 / {versusLastYear(doneWeek.count, doneWeek.lastYear)}</div>
        </div>
        <div>
          <div className="text-3xl font-bold">{doneMonth.count}</div>
          <div className="text-xs text-muted-foreground">過去 1 か月 / {versusLastYear(doneMonth.count, doneMonth.lastYear)}</div>
        </div>
      </CardContent>
    </Card>
  );
}
