import { useProjects } from '@/api/queries/use-projects';
import { CreateProjectForm } from '@/components/project/CreateProjectForm';
import { ProjectCard } from '@/components/project/ProjectCard';

export function ProjectsPage() {
  const { data, error } = useProjects();
  if (error) return <p className="text-destructive">{error.message}</p>;

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-semibold">プロジェクト</h1>
      <CreateProjectForm />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(data?.projects ?? []).map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
