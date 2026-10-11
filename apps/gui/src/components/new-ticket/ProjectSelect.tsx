import type { ProjectSummary } from '@/api/project-summary';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Props = {
  projects: ProjectSummary[];
  value: string;
  onChange: (value: string) => void;
};

export function ProjectSelect({ projects, value, onChange }: Props) {
  return (
    <Label>
      プロジェクト
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-64">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p.id} value={String(p.id)}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Label>
  );
}
