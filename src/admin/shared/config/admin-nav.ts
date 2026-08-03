export type AdminRoute = '/admin' | '/admin/reports';

export type AdminNavItem = {
  key: string;
  label: string;
  href?: AdminRoute;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin' },
  { key: 'reports', label: 'Reportes', href: '/admin/reports' },
  { key: 'users', label: 'Usuarios' },
  { key: 'rewards', label: 'Recompensas' },
];
