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
  | '/admin/municipio'
  | '/admin/municipio/reportes'
  | '/admin/municipio/alertas'
  | '/admin/municipio/campanas';

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
  { key: 'municipio', label: 'Resumen municipal', icon: 'building', href: '/admin/municipio', roles: ['municipal'] },
  { key: 'municipio-reportes', label: 'Reportes y auditoría', icon: 'clipboard-check', href: '/admin/municipio/reportes', roles: ['municipal'] },
  { key: 'municipio-alertas', label: 'Señales y alertas', icon: 'bell', href: '/admin/municipio/alertas', roles: ['municipal'] },
  { key: 'municipio-campanas', label: 'Campañas', icon: 'bullhorn', href: '/admin/municipio/campanas', roles: ['municipal'] },
];

export function getAdminNav(role: UserRole | undefined): AdminNavItem[] {
  return ADMIN_NAV.filter((item) => !role || !item.roles || item.roles.includes(role));
}
