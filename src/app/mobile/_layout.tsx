import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { BrandColors } from '@/constants/theme';
import { useAppFonts } from '@/hooks/useAppFonts';
import { useAuth } from '@/shared/firebase/auth-context';

export default function MobileLayout() {
  const { loaded } = useAppFonts();
  const { user, loading } = useAuth();

  if (Platform.OS === 'web') return <Redirect href="/" />;
  if (!loaded) return null;
  if (loading) return null;
  if (!user) return <Redirect href="/mobile/login" />;

  return (
    <>
      <StatusBar style="light" translucent={true} />
      <AnimatedSplashOverlay />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: BrandColors.tertiary },
        }}
      />
    </>
  );
}
