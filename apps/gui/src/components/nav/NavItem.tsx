import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

type Props = {
  to: string;
  label: string;
  /** 完全一致のときだけ、選択中にする */
  end?: boolean;
  /** ラベルの後ろに添える(バッジなど) */
  children?: ReactNode;
};

export function NavItem({ to, label, end = false, children }: Props) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => cn('rounded-md px-3 py-1 text-sm hover:bg-accent', isActive && 'bg-accent font-semibold')}
    >
      {label}
      {children}
    </NavLink>
  );
}
