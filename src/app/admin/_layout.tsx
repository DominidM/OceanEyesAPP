import { Redirect, Slot, usePathname } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { useAuth } from '@/shared/firebase/auth-context';
import { AdminThemeProvider } from '@admin/shared/theme/context';

export default function AdminLayout() {
  const { user, profile, loading } = useAuth();
  const pathname = usePathname();

  if (Platform.OS !== 'web') return <Redirect href="/mobile" />;
  if (pathname === '/admin/login') return <Slot />;
  if (loading) return null;
  if (!user || profile?.role !== 'admin') return <Redirect href="/admin/login" />;

  return (
    <AdminThemeProvider>
      <Slot />
    </AdminThemeProvider>
  );
}
