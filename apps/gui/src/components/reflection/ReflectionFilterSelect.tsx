import { useSearchParams } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Props = {
  /** 絞り込みの検索パラメータの名前 */
  name: 'status' | 'target' | 'role';
  /** 絞り込まないときの表示 */
  allLabel: string;
  /** [値, 表示] */
  options: Array<[string, string]>;
};

export function ReflectionFilterSelect({ name, allLabel, options }: Props) {
  const [params, setParams] = useSearchParams();

  const change = (value: string) => {
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete(name);
    else next.set(name, value);
    setParams(next);
  };

  return (
    <Select value={params.get(name) ?? 'all'} onValueChange={change}>
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
