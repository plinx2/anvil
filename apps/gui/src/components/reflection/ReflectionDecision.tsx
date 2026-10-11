import { useState } from 'react';
import { decideReflection } from '@/api/actions/decide-reflection';
import type { Reflection } from '@/api/reflection';
import { useAct } from '@/api/use-act';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ReflectionDecision({ reflection }: { reflection: Reflection }) {
  const act = useAct();
  const [reason, setReason] = useState('');

  if (reflection.status !== 'pending') {
    return (
      <Button size="sm" variant="outline" onClick={() => act.mutate(() => decideReflection(reflection.id, 'pending'))}>
        未判断に戻す
      </Button>
    );
  }

  return (
    <>
      <Button size="sm" onClick={() => act.mutate(() => decideReflection(reflection.id, 'adopted'))}>
        採用
      </Button>
      <Input className="w-56" placeholder="却下の理由(任意)" value={reason} onChange={(e) => setReason(e.target.value)} />
      <Button
        size="sm"
        variant="destructive"
        onClick={() => act.mutate(() => decideReflection(reflection.id, 'rejected', reason || undefined))}
      >
        却下
      </Button>
    </>
  );
}
