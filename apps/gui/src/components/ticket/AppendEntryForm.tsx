import { useState } from 'react';
import { addEntry } from '@/api/actions/add-entry';
import { useAct } from '@/api/use-act';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function AppendEntryForm({ ticketId }: { ticketId: number }) {
  const act = useAct();
  const [entry, setEntry] = useState('');

  return (
    <>
      <Textarea placeholder="エントリを追記(人間として)" value={entry} onChange={(e) => setEntry(e.target.value)} />
      <div>
        <Button
          variant="outline"
          size="sm"
          disabled={!entry.trim()}
          onClick={() => act.mutate(() => addEntry(ticketId, entry), { onSuccess: () => setEntry('') })}
        >
          追記
        </Button>
      </div>
    </>
  );
}
