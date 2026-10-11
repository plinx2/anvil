import { Link } from 'react-router-dom';
import type { Dashboard } from '@/api/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ReflectionsPendingCard({ dashboard }: { dashboard: Dashboard }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>振り返り</CardTitle>
      </CardHeader>
      <CardContent>
        <Link to="/reflections" className="text-primary hover:underline">
          未判断 {dashboard.reflectionsPending} 件
        </Link>
      </CardContent>
    </Card>
  );
}
