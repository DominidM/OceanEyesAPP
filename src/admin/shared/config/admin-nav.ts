export type AdminRoute = '/admin' | '/admin/reports' | '/admin/users' | '/admin/bans';

export type AdminNavItem = {
  key: string;
  label: string;
  href?: AdminRoute;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin' },
  { key: 'reports', label: 'Reportes', href: '/admin/reports' },
  { key: 'users', label: 'Usuarios', href: '/admin/users' },
  { key: 'bans', label: 'Dispositivos baneados', href: '/admin/bans' },
  { key: 'rewards', label: 'Recompensas' },
];
