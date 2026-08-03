import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { BrandColors } from '@/constants/theme';
import { useAppFonts } from '@/hooks/useAppFonts';
import { useAuth } from '@/shared/firebase/auth-context';
import { isFirebaseConfigured } from '@/shared/firebase/config';

export default function MobileLayout() {
  const { loaded } = useAppFonts();
  const { user, loading } = useAuth();
  const firebaseReady = isFirebaseConfigured();

  if (Platform.OS === 'web') return <Redirect href="/" />;

  if (!loaded) return null;

  return (
    <>
      <StatusBar style="light" translucent={true} />
      <AnimatedSplashOverlay />
      {!firebaseReady ? (
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: BrandColors.tertiary },
          }}
        />
      ) : loading ? null : user ? (
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: BrandColors.tertiary },
          }}
        />
      ) : (
        <Redirect href="/mobile/login" />
      )}
    </>
  );
}
