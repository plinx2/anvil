import { useState } from 'react';
import { addRepo } from '@/api/actions/add-repo';
import { useAct } from '@/api/use-act';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AddRepoForm({ projectId }: { projectId: number }) {
  const act = useAct();
  const [name, setName] = useState('');
  const [repoPath, setRepoPath] = useState('');
  const [branch, setBranch] = useState('main');
  const [remote, setRemote] = useState(false);

  const reset = () => {
    setName('');
    setRepoPath('');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input className="w-28" placeholder="名前" value={name} onChange={(e) => setName(e.target.value)} />
      <Input className="min-w-40 flex-1" placeholder="ローカルのパス" value={repoPath} onChange={(e) => setRepoPath(e.target.value)} />
      <Input className="w-32" placeholder="デフォルトブランチ" value={branch} onChange={(e) => setBranch(e.target.value)} />
      <Label>
        <Checkbox checked={remote} onCheckedChange={(v) => setRemote(v === true)} />
        リモートあり
      </Label>
      <Button
        variant="outline"
        size="sm"
        disabled={!name || !repoPath}
        onClick={() =>
          act.mutate(() => addRepo(projectId, { name, path: repoPath, defaultBranch: branch, hasRemote: remote }), { onSuccess: reset })
        }
      >
        追加
      </Button>
    </div>
  );
}
