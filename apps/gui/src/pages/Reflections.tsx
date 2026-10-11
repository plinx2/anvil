import { useSearchParams } from 'react-router-dom';
import { useReflections } from '@/api/queries/use-reflections';
import { Empty } from '@/components/common';
import { ReflectionCard } from '@/components/reflection/ReflectionCard';
import { ReflectionFilters } from '@/components/reflection/ReflectionFilters';

export function ReflectionsPage() {
  const [params] = useSearchParams();
  const { data, error } = useReflections({
    status: params.get('status') ?? undefined,
    target: params.get('target') ?? undefined,
    role: params.get('role') ?? undefined,
  });
  const reflections = data?.reflections;

  return (
    <div className="grid gap-4">
      <h1 className="text-xl font-semibold">振り返り</h1>
      <ReflectionFilters />
      {error && <p className="text-destructive">{error.message}</p>}
      {reflections?.length ? reflections.map((r) => <ReflectionCard key={r.id} reflection={r} />) : <Empty>該当なし</Empty>}
    </div>
  );
}
