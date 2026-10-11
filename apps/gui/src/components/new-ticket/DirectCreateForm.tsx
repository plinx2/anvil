import { useState } from 'react';
import { createTicket } from '@/api/actions/create-ticket';
import { useAct } from '@/api/use-act';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  projectId: number;
  autoGate: boolean;
  onDone: () => void;
};

/** 開発用。エージェントを介さずに、チケットを直接作る。 */
export function DirectCreateForm({ projectId, autoGate, onDone }: Props) {
  const act = useAct();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const create = () =>
    act.mutate(() => createTicket(projectId, title, body, autoGate), {
      onSuccess: () => {
        setTitle('');
        setBody('');
        onDone();
      },
    });

  return (
    <details>
      <summary className="cursor-pointer text-sm text-muted-foreground">直接作成(開発用。エージェントを介さない)</summary>
      <div className="mt-2 grid gap-2">
        <Input placeholder="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="内容" value={body} onChange={(e) => setBody(e.target.value)} />
        <div>
          <Button variant="outline" disabled={!title.trim()} onClick={create}>
            作成
          </Button>
        </div>
      </div>
    </details>
  );
}
