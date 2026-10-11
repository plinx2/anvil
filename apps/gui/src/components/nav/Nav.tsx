import { NavLink } from 'react-router-dom';
import { NavItem } from '@/components/nav/NavItem';
import { ReflectionsNavItem } from '@/components/nav/ReflectionsNavItem';
import { NewTicketDialog } from '@/components/new-ticket/NewTicketDialog';

export function Nav() {
  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center gap-4 border-b bg-card px-4 py-2.5">
      <NavLink to="/" className="text-lg font-bold tracking-wide text-primary">
        anvil
      </NavLink>
      <nav className="flex flex-1 flex-wrap gap-1">
        <NavItem to="/" label="ダッシュボード" end />
        <NavItem to="/board" label="カンバン" />
        <NavItem to="/projects" label="プロジェクト" />
        <ReflectionsNavItem />
      </nav>
      <NewTicketDialog />
    </header>
  );
}
