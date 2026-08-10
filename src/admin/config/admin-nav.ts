export type AdminRoute = '/admin' | '/admin/reports' | '/admin/users' | '/admin/bans' | '/admin/rewards' | '/admin/redemptions' | '/admin/alerts';

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
  { key: 'bans', label: 'Baneos', icon: 'ban', href: '/admin/bans' },
  { key: 'rewards', label: 'Recompensas', icon: 'award', href: '/admin/rewards' },
  { key: 'redemptions', label: 'Canjes', icon: 'exchange-alt', href: '/admin/redemptions' },
  { key: 'alerts', label: 'Alertas', icon: 'bell', href: '/admin/alerts' },
];
