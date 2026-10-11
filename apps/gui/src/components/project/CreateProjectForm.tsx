import { useState } from 'react';
import { createProject } from '@/api/actions/create-project';
import { useAct } from '@/api/use-act';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function CreateProjectForm() {
  const act = useAct();
  const [name, setName] = useState('');

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-2">
        <Input className="w-64" placeholder="プロジェクト名" value={name} onChange={(e) => setName(e.target.value)} />
        <Button disabled={!name.trim()} onClick={() => act.mutate(() => createProject(name), { onSuccess: () => setName('') })}>
          プロジェクトを登録
        </Button>
      </CardContent>
    </Card>
  );
}
