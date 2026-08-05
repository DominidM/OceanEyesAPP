import { Redirect, usePathname } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { useAuth } from '@/shared/firebase/auth-context';
import { AdminLayout } from '@admin/layout/admin-layout';

export default function AdminRouteLayout() {
  const { user, profile, loading } = useAuth();
  const pathname = usePathname();

  if (Platform.OS !== 'web') return <Redirect href="/mobile" />;
  if (loading) return null;
  if (pathname !== '/admin/login' && (!user || profile?.role !== 'admin')) {
    return <Redirect href="/admin/login" />;
  }

  return <AdminLayout />;
}
