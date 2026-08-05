import { usePathname } from 'expo-router';

import { ADMIN_NAV } from '@admin/config/admin-nav';

export function useAdminNav() {
  const pathname = usePathname();

  return {
    pathname,
    items: ADMIN_NAV,
    isActive: (href?: string) => !!href && pathname === href,
  };
}
