import { useDashboard } from '@/api/queries/use-dashboard';
import { AwaitingCard } from '@/components/dashboard/AwaitingCard';
import { DoneCountCard } from '@/components/dashboard/DoneCountCard';
import { GatesCard } from '@/components/dashboard/GatesCard';
import { ProblemsCard } from '@/components/dashboard/ProblemsCard';
import { RecentProjectsCard } from '@/components/dashboard/RecentProjectsCard';
import { ReflectionsPendingCard } from '@/components/dashboard/ReflectionsPendingCard';
import { WorkingCard } from '@/components/dashboard/WorkingCard';

export function DashboardPage() {
  const { data, error } = useDashboard();
  const dashboard = data?.dashboard;
  if (error) return <p className="text-destructive">{error.message}</p>;
  if (!dashboard) return <p className="text-muted-foreground">読み込み中…</p>;

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-semibold">ダッシュボード</h1>
      <ProblemsCard dashboard={dashboard} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AwaitingCard dashboard={dashboard} />
        <WorkingCard dashboard={dashboard} />
        <GatesCard dashboard={dashboard} />
        <DoneCountCard dashboard={dashboard} />
        <RecentProjectsCard dashboard={dashboard} />
        <ReflectionsPendingCard dashboard={dashboard} />
      </div>
    </div>
  );
}
