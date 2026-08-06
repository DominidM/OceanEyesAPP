import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { BrandColors } from '@/constants/theme';
import { useAppFonts } from '@/hooks/useAppFonts';

export default function MobileLayout() {
  const { loaded } = useAppFonts();

  if (Platform.OS === 'web') return <Redirect href="/admin" />;
  if (!loaded) return null;

  return (
    <>
      <StatusBar style="dark" translucent={true} />
      <AnimatedSplashOverlay />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: BrandColors.tertiary },
        }}
      />
    </>
  );
}
