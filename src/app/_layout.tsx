import { Slot, Stack } from 'expo-router';
import { DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { Platform } from 'react-native';

import { BrandColors } from '@/constants/theme';

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
      {Platform.OS === 'web' ? <Slot /> : <Stack screenOptions={{ headerShown: false }} />}
    </ThemeProvider>
  );
}
