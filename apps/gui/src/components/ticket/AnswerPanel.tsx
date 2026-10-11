import { useState } from 'react';
import { answerQuestion } from '@/api/actions/answer-question';
import { useAct } from '@/api/use-act';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function AnswerPanel({ ticketId }: { ticketId: number }) {
  const act = useAct();
  const [answer, setAnswer] = useState('');

  return (
    <div className="grid gap-2 rounded-lg border border-gate-border bg-gate p-3">
      <strong className="text-sm">承認待ち: 人間の回答を待っている</strong>
      <Textarea placeholder="回答(同じ状態が続く)" value={answer} onChange={(e) => setAnswer(e.target.value)} />
      <div>
        <Button
          disabled={!answer.trim()}
          onClick={() => act.mutate(() => answerQuestion(ticketId, answer), { onSuccess: () => setAnswer('') })}
        >
          回答する
        </Button>
      </div>
    </div>
  );
}
