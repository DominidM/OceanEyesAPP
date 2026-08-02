import { Stack } from 'expo-router';
import { DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { BrandColors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

const AppLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: BrandColors.primary,
    background: BrandColors.tertiary,
    card: BrandColors.tertiary,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={AppLightTheme}>
      <StatusBar style="light" translucent={true} />
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: BrandColors.tertiary } }} />
    </ThemeProvider>
  );
}
