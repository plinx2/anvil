import { Link } from 'react-router-dom';
import type { ProjectSummary } from '@/api/project-summary';
import { ago } from '@/components/common';
import { AddRepoForm } from '@/components/project/AddRepoForm';
import { ProjectContextPages } from '@/components/project/ProjectContextPages';
import { RepoList } from '@/components/project/RepoList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link to={`/board/${project.id}`} className="text-primary hover:underline">
            {project.name}
          </Link>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          チケット {project.tickets} 件(未完了 {project.openTickets})/ 更新 {ago(project.updatedAt)}
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="text-xs text-muted-foreground">リポジトリ</div>
        <RepoList project={project} />
        <AddRepoForm projectId={project.id} />
        <ProjectContextPages projectId={project.id} />
      </CardContent>
    </Card>
  );
}
