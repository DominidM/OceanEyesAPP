export type AdminRoute = '/admin' | '/admin/reports' | '/admin/users';

export type AdminNavItem = {
  key: string;
  label: string;
  icon: string;
  href?: AdminRoute;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'tachometer-alt', href: '/admin' },
  { key: 'reports', label: 'Reportes', icon: 'clipboard-list', href: '/admin/reports' },
  { key: 'users', label: 'Usuarios', icon: 'users', href: '/admin/users' },
  { key: 'rewards', label: 'Recompensas', icon: 'award' },
];
