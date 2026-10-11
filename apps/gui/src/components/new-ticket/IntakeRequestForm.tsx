import { useState } from 'react';
import { toast } from 'sonner';
import { requestIntake } from '@/api/actions/request-intake';
import { useAct } from '@/api/use-act';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  projectId: number;
  autoGate: boolean;
  onAutoGateChange: (value: boolean) => void;
  onDone: () => void;
};

/** やりたいことを渡して、PBI 起票担当に起票させる。 */
export function IntakeRequestForm({ projectId, autoGate, onAutoGateChange, onDone }: Props) {
  const act = useAct();
  const [wish, setWish] = useState('');

  const request = () =>
    act.mutate(() => requestIntake(projectId, wish, autoGate), {
      onSuccess: () => {
        setWish('');
        onDone();
        toast.success('起票担当に依頼した(herdr で会話する)');
      },
    });

  return (
    <>
      <Textarea className="min-h-36" placeholder="やりたいこと(複数行)" value={wish} onChange={(e) => setWish(e.target.value)} />
      <div className="flex items-center justify-between gap-3">
        <Label>
          <Checkbox checked={autoGate} onCheckedChange={(v) => onAutoGateChange(v === true)} />
          自動ゲート承認
        </Label>
        <Button disabled={!wish.trim()} onClick={request}>
          起票
        </Button>
      </div>
    </>
  );
}
