import { State } from '@anvil/entity';
import { focusAgent } from '@/api/actions/focus-agent';
import { passPreDoneGate } from '@/api/actions/pass-pre-done-gate';
import { passPreImplGate } from '@/api/actions/pass-pre-impl-gate';
import { startAgent } from '@/api/actions/start-agent';
import { startTicket } from '@/api/actions/start-ticket';
import type { TicketDetail } from '@/api/ticket-detail';
import { useAct } from '@/api/use-act';
import { PassPreDesignGateAction } from '@/components/ticket/PassPreDesignGateAction';
import { Button } from '@/components/ui/button';

export function StateActions({ detail }: { detail: TicketDetail }) {
  const t = detail.ticket;
  const act = useAct();
  const current = State.of(t.state);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {t.state === 'todo' && (
        <Button disabled={t.unmet.length > 0} onClick={() => act.mutate(() => startTicket(t.id))}>
          リファインに進める
        </Button>
      )}
      {current.hasAgent && !t.awaiting && !t.agentActive && t.unmet.length === 0 && (
        <Button onClick={() => act.mutate(() => startAgent(t.id))}>着手(エージェントを起動)</Button>
      )}
      {t.agentActive && (
        <Button variant="outline" onClick={() => act.mutate(() => focusAgent(t.id))}>
          ペインを開く
        </Button>
      )}
      {t.state === 'pre_design_gate' && <PassPreDesignGateAction ticketId={t.id} />}
      {t.state === 'pre_impl_gate' && <Button onClick={() => act.mutate(() => passPreImplGate(t.id))}>実装前ゲートを承認</Button>}
      {t.state === 'pre_done_gate' && (
        <Button onClick={() => act.mutate(() => passPreDoneGate(t.id))}>完了前ゲートを承認(完了にする)</Button>
      )}
      {!(t.state === 'todo' || t.isGate || current.hasAgent) && <span className="text-sm text-muted-foreground">完了</span>}
    </div>
  );
}
