import { useDashboard } from '@/api/queries/use-dashboard';
import { NavItem } from '@/components/nav/NavItem';
import { Badge } from '@/components/ui/badge';

/** 振り返りへのリンク。未判断があれば、件数を添える。 */
export function ReflectionsNavItem() {
  const { data } = useDashboard();
  const pending = data?.dashboard.reflectionsPending ?? 0;

  return (
    <NavItem to="/reflections" label="振り返り">
      {pending > 0 && (
        <Badge variant="warn" className="ml-1.5">
          {pending}
        </Badge>
      )}
    </NavItem>
  );
}
