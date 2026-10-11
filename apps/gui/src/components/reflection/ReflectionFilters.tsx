import { Role } from '@anvil/entity';
import { ReflectionFilterSelect } from '@/components/reflection/ReflectionFilterSelect';
import { STATUS_LABELS, TARGET_LABELS } from '@/components/reflection/reflection-labels';

export function ReflectionFilters() {
  return (
    <div className="flex flex-wrap gap-2">
      <ReflectionFilterSelect name="status" allLabel="すべての状態" options={Object.entries(STATUS_LABELS)} />
      <ReflectionFilterSelect name="target" allLabel="すべての対象" options={Object.entries(TARGET_LABELS)} />
      <ReflectionFilterSelect
        name="role"
        allLabel="すべてのロール"
        options={Role.all.filter((r) => !r.isBackground).map((r): [string, string] => [r.id, r.label])}
      />
    </div>
  );
}
