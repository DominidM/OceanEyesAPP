import { Redirect } from 'expo-router';
import React from 'react';

import { HomeScreen } from '@/modules/home/presentation/screens/home-screen';
import { useAuth } from '@/shared/firebase/auth-context';
import { useGuestStatus } from '@/shared/hooks/use-guest-status';

export default function MobileIndex() {
  const { loading } = useAuth();
  const guest = useGuestStatus();

  if (loading) return null;

  // TEMPORAL: en desarrollo se permite entrar sin sesión (botón "Entrar al dashboard (temporal)").
  if (guest && !__DEV__) return <Redirect href="/mobile/login" />;

  return <HomeScreen />;
}
