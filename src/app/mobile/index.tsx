import React from 'react';

import { HomeScreen } from '@/modules/home/presentation/screens/home-screen';
import { useAuth } from '@/shared/firebase/auth-context';

export default function MobileIndex() {
  const { loading } = useAuth();

  if (loading) return null;

  return <HomeScreen />;
}
