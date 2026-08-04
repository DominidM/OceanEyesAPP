import { Slot, Stack, usePathname } from 'expo-router';
import { DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { BrandColors } from '@/constants/theme';
import { LandingSplash } from '@landing/presentation/components/landing-splash';
import { CustomCursor } from '@landing/presentation/components/custom-cursor';
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

const LANDING_PATHS = new Set(['/', '/faq', '/descargas', '/contacto']);

let splashShownOnce = false;

function SplashGate({ initialPath }: { initialPath: string | null }) {
  const [visible, setVisible] = useState(() => {
    if (initialPath == null || !LANDING_PATHS.has(initialPath)) return false;
    if (splashShownOnce) return false;
    splashShownOnce = true;
    return true;
  });

  if (!visible) return null;

  return (
    <LandingSplash
      duration={(4 * 1300) + 600}
      onFinish={() => setVisible(false)}
    />
  );
}

export default function RootLayout() {
  const pathname = usePathname();
  const initialPathRef = useRef<string | null>(pathname);
  const [splashInitialPath] = useState<string | null>(() => initialPathRef.current);
  const isLandingPath = LANDING_PATHS.has(pathname);

  return (
    <ThemeProvider value={AppLightTheme}>
      <AuthProvider>
        <ConnectivityProvider>
          <SyncProvider>
            {Platform.OS === 'web' ? (
              <View style={styles.webRoot}>
                {isLandingPath && <CustomCursor />}
                <SplashGate initialPath={splashInitialPath} />
                <Slot />
              </View>
            ) : (
              <Stack screenOptions={{ headerShown: false }} />
            )}
          </SyncProvider>
        </ConnectivityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    backgroundColor: BrandColors.tertiary,
  },
});
