import { Slot, Stack } from 'expo-router';
import { DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { Platform } from 'react-native';

import { BrandColors } from '@/constants/theme';
import { AuthProvider } from '@/shared/firebase/auth-context';
import { ConnectivityProvider } from '@/shared/offline/connectivity-context';
import { SyncProvider } from '@/shared/offline/sync-context';

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
        <ConnectivityProvider>
          <SyncProvider>
            {Platform.OS === 'web' ? <Slot /> : <Stack screenOptions={{ headerShown: false }} />}
          </SyncProvider>
        </ConnectivityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
