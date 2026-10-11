import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/api/queries/use-projects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function BoardProjectFilter({ projectId }: { projectId?: string }) {
  const navigate = useNavigate();
  const { data } = useProjects();

  return (
    <Select value={projectId ?? 'all'} onValueChange={(v) => navigate(v === 'all' ? '/board' : `/board/${v}`)}>
      <SelectTrigger className="w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">すべてのプロジェクト</SelectItem>
        {(data?.projects ?? []).map((p) => (
          <SelectItem key={p.id} value={String(p.id)}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
