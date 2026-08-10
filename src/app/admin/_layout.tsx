import { Redirect, usePathname } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { useAuth } from '@/shared/firebase/auth-context';
import { AdminLayout } from '@admin/layout/admin-layout';

const MUNICIPAL_PATHS = new Set([
  '/admin/municipio',
  '/admin/login',
]);

export default function AdminRouteLayout() {
  const { user, profile, loading } = useAuth();
  const pathname = usePathname();

  if (Platform.OS !== 'web') return <Redirect href="/mobile" />;
  if (loading) return null;

  const isAdmin = profile?.role === 'admin';
  const isMunicipal = profile?.role === 'municipal';

  if (!isAdmin && !isMunicipal) {
    return <Redirect href="/admin/login" />;
  }

  if (isMunicipal && !MUNICIPAL_PATHS.has(pathname)) {
    return <Redirect href="/admin/municipio" />;
  }

  if (pathname === '/admin/login') {
    return <Redirect href={isAdmin ? '/admin' : '/admin/municipio'} />;
  }

  return <AdminLayout />;
}