import type { ProjectSummary } from '@/api/project-summary';
import { Empty } from '@/components/common';

export function RepoList({ project }: { project: ProjectSummary }) {
  if (project.repos.length === 0) return <Empty>まだ無い</Empty>;

  return (
    <ul className="divide-y">
      {project.repos.map((r) => (
        <li key={r.id} className="flex flex-wrap gap-2 py-1">
          <strong>{r.name}</strong>
          <span className="text-muted-foreground">
            {r.path} / {r.defaultBranch} / {r.hasRemote ? 'リモートあり' : 'リモートなし'}
          </span>
        </li>
      ))}
    </ul>
  );
}
