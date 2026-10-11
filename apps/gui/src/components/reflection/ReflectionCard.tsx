import { Role } from '@anvil/entity';
import { Link } from 'react-router-dom';
import type { Reflection } from '@/api/reflection';
import { ago } from '@/components/common';
import { ReflectionDecision } from '@/components/reflection/ReflectionDecision';
import { ReflectionField } from '@/components/reflection/ReflectionField';
import { STATUS_LABELS, TARGET_LABELS } from '@/components/reflection/reflection-labels';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export function ReflectionCard({ reflection }: { reflection: Reflection }) {
  const r = reflection;

  return (
    <Card>
      <CardContent className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{STATUS_LABELS[r.status]}</Badge>
          <Badge variant="outline">{TARGET_LABELS[r.target] ?? r.target}</Badge>
          <strong className="text-sm">{Role.of(r.role).label}</strong>
          {r.ticketId && (
            <Link to={`/tickets/${r.ticketId}`} className="text-sm text-primary hover:underline">
              T-{r.ticketId}
            </Link>
          )}
          <span className="text-xs text-muted-foreground">{ago(r.createdAt)}</span>
        </div>
        <ReflectionField label="良かった点" value={r.good} />
        <ReflectionField label="困った点" value={r.trouble} />
        <ReflectionField label="原因の仮説" value={r.hypothesis} />
        <ReflectionField label="改善案" value={r.proposal} />
        <ReflectionField label="根拠" value={r.evidence} />
        <ReflectionField label="却下の理由" value={r.rejectReason} />
        <div className="flex flex-wrap items-center gap-2">
          <ReflectionDecision reflection={r} />
        </div>
      </CardContent>
    </Card>
  );
}
