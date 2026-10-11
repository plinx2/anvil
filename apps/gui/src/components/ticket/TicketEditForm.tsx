import { useState } from 'react';
import { updateTicket } from '@/api/actions/update-ticket';
import { useProjects } from '@/api/queries/use-projects';
import type { TicketDetail } from '@/api/ticket-detail';
import { useAct } from '@/api/use-act';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function TicketEditForm({ detail, onClose }: { detail: TicketDetail; onClose: () => void }) {
  const t = detail.ticket;
  const act = useAct();
  const { data: projectList } = useProjects();
  const repos = projectList?.projects.find((p) => p.name === t.project)?.repos ?? [];
  const [edit, setEdit] = useState({
    title: t.title,
    body: t.body,
    slug: t.slug,
    designNeeded: t.designNeeded,
    targetRepos: t.targetRepos,
  });

  return (
    <div className="grid gap-3">
      <Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
      <Textarea className="min-h-36" value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} />
      <div className="flex flex-wrap items-center gap-4">
        <Label>
          slug
          <Input
            className="w-56"
            value={edit.slug}
            disabled={detail.branches.length > 0}
            onChange={(e) => setEdit({ ...edit, slug: e.target.value })}
          />
        </Label>
        <Label>
          <Checkbox
            checked={edit.designNeeded}
            disabled={t.kind === 'spike'}
            onCheckedChange={(v) => setEdit({ ...edit, designNeeded: v === true })}
          />
          デザイン要
        </Label>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        対象リポジトリ:
        {repos.map((r) => (
          <Label key={r.id}>
            <Checkbox
              checked={edit.targetRepos.includes(r.name)}
              onCheckedChange={(v) =>
                setEdit({
                  ...edit,
                  targetRepos: v === true ? [...edit.targetRepos, r.name] : edit.targetRepos.filter((x) => x !== r.name),
                })
              }
            />
            {r.name}
          </Label>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => act.mutate(() => updateTicket(t.id, edit), { onSuccess: onClose })}>保存</Button>
        <Button variant="ghost" onClick={onClose}>
          やめる
        </Button>
      </div>
    </div>
  );
}
