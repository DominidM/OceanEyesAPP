import { Slot, Stack } from 'expo-router';
import { DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { Platform } from 'react-native';

import { BrandColors } from '@/constants/theme';
import { AuthProvider } from '@/shared/firebase/auth-context';

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
      <AuthProvider>
        {Platform.OS === 'web' ? <Slot /> : <Stack screenOptions={{ headerShown: false }} />}
      </AuthProvider>
    </ThemeProvider>
  );
}
