import { Redirect, Slot, usePathname } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { useAuth } from '@/shared/firebase/auth-context';
import { AdminLayout } from '@admin/layout/admin-layout';
import { AdminThemeProvider } from '@admin/theme/context';
import { WalletProvider } from '@admin/presentation/hooks/useWallet';

export default function AdminRouteLayout() {
  const { profile, loading } = useAuth();
  const pathname = usePathname();

  if (Platform.OS !== 'web') return <Redirect href="/mobile" />;

  // Login se renderiza sin auth para evitar loop de redirección,
  // pero con los mismos providers admin para que hooks como useWallet
  // no fallen si algún componente compartido los usa.
  if (pathname === '/admin/login') {
    return (
      <AdminThemeProvider>
        <WalletProvider>
          <Slot />
        </WalletProvider>
      </AdminThemeProvider>
    );
  }

  if (loading) return null;

  const isAdmin = profile?.role === 'admin';
  const isMunicipal = profile?.role === 'municipal';

  if (!isAdmin && !isMunicipal) {
    return <Redirect href="/admin/login" />;
  }

  if (isMunicipal && pathname !== '/admin/login' && !pathname.startsWith('/admin/municipio')) {
    return <Redirect href="/admin/municipio" />;
  }

  if (pathname === '/admin/login') {
    return <Redirect href={isAdmin ? '/admin' : '/admin/municipio'} />;
  }

  return <AdminLayout />;
}
