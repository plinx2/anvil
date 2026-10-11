import { useState } from 'react';
import { passPreDesignGate } from '@/api/actions/pass-pre-design-gate';
import { useAct } from '@/api/use-act';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PassPreDesignGateAction({ ticketId }: { ticketId: number }) {
  const act = useAct();
  const [sp, setSp] = useState('');

  return (
    <div className="flex items-center gap-2">
      <Input className="w-24" type="number" min="0.5" step="0.5" placeholder="SP" value={sp} onChange={(e) => setSp(e.target.value)} />
      <Button onClick={() => act.mutate(() => passPreDesignGate(ticketId, Number(sp)))}>設計前ゲートを突破</Button>
    </div>
  );
}
