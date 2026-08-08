import { Redirect } from 'expo-router';
import React from 'react';

import { HomeScreen } from '@/modules/home/presentation/screens/home-screen';
import { useAuth } from '@/shared/firebase/auth-context';

export default function MobileIndex() {
  const { user, loading } = useAuth();

  if (loading) return null;

  // Acceso restringido: solo usuarios autenticados entran al home.
  if (!user || user.isAnonymous) return <Redirect href="/mobile/login" />;

  return <HomeScreen />;
}
