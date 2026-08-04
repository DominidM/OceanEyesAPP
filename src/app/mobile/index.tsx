import React from 'react';
// import { Redirect } from 'expo-router';

import { HomeScreen } from '@/modules/home/presentation/screens/home-screen';
import { useAuth } from '@/shared/firebase/auth-context';

export default function MobileIndex() {
  // Acceso libre: los invitados entran directo al home sin iniciar sesión.
  // const { user, loading } = useAuth();
  const { loading } = useAuth();

  if (loading) return null;
  // if (!user) return <Redirect href="/mobile/login" />;

  return <HomeScreen />;
}
