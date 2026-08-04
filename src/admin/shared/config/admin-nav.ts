export type AdminRoute = '/admin' | '/admin/reports' | '/admin/users';

export type AdminNavItem = {
  key: string;
  label: string;
  href?: AdminRoute;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin' },
  { key: 'reports', label: 'Reportes', href: '/admin/reports' },
  { key: 'users', label: 'Usuarios', href: '/admin/users' },
  { key: 'rewards', label: 'Recompensas' },
];
