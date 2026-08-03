import { Stack } from 'expo-router';
import { DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import React from 'react';

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
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
