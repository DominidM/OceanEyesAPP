import { Redirect } from 'expo-router';
import React from 'react';

import { HomeScreen } from '@/modules/home/presentation/screens/home-screen';
import { useAuth } from '@/shared/firebase/auth-context';
import { useGuestStatus } from '@/shared/hooks/use-guest-status';

export default function MobileIndex() {
  const { loading } = useAuth();
  const guest = useGuestStatus();

  if (loading) return null;

  // Acceso restringido: solo usuarios autenticados entran al home.
  if (guest) return <Redirect href="/mobile/login" />;

  return <HomeScreen />;
}
