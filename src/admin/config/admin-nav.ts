import type { UserRole } from '@/shared/firebase/types';

export type AdminRoute =
  | '/admin'
  | '/admin/reports'
  | '/admin/users'
  | '/admin/bans'
  | '/admin/rewards'
  | '/admin/redemptions'
  | '/admin/alerts'
  | '/admin/municipalities'
  | '/admin/organizations'
  | '/admin/municipio';

export type AdminNavItem = {
  key: string;
  label: string;
  icon: string;
  href?: AdminRoute;
  roles?: UserRole[];
};

export const ADMIN_NAV: AdminNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'tachometer-alt', href: '/admin', roles: ['admin'] },
  { key: 'reports', label: 'Reportes', icon: 'clipboard-list', href: '/admin/reports', roles: ['admin'] },
  { key: 'users', label: 'Usuarios', icon: 'users', href: '/admin/users', roles: ['admin'] },
  { key: 'bans', label: 'Baneos', icon: 'ban', href: '/admin/bans', roles: ['admin'] },
  { key: 'rewards', label: 'Recompensas', icon: 'award', href: '/admin/rewards', roles: ['admin'] },
  { key: 'redemptions', label: 'Canjes', icon: 'exchange-alt', href: '/admin/redemptions', roles: ['admin'] },
  { key: 'alerts', label: 'Alertas', icon: 'bell', href: '/admin/alerts', roles: ['admin'] },
  {
    key: 'municipalities',
    label: 'Municipalidades',
    icon: 'landmark',
    href: '/admin/municipalities',
    roles: ['admin'],
  },
  {
    key: 'organizations',
    label: 'ONGs',
    icon: 'hands-helping',
    href: '/admin/organizations',
    roles: ['admin'],
  },
  { key: 'municipio', label: 'Mi municipio', icon: 'building', href: '/admin/municipio', roles: ['municipal'] },
];

export function getAdminNav(role: UserRole | undefined): AdminNavItem[] {
  return ADMIN_NAV.filter((item) => !role || !item.roles || item.roles.includes(role));
}