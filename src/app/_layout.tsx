import { Slot, Stack, usePathname } from 'expo-router';
import { DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { BrandColors } from '@/constants/theme';

const SCROLLBAR_CSS = `
  html::-webkit-scrollbar,
  body::-webkit-scrollbar,
  *::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  html::-webkit-scrollbar-track,
  body::-webkit-scrollbar-track,
  *::-webkit-scrollbar-track {
    background: ${BrandColors.tertiary};
  }
  html::-webkit-scrollbar-thumb,
  body::-webkit-scrollbar-thumb,
  *::-webkit-scrollbar-thumb {
    background: ${BrandColors.secondary};
    border-radius: 999px;
    border: 3px solid ${BrandColors.tertiary};
  }
  html::-webkit-scrollbar-thumb:hover,
  body::-webkit-scrollbar-thumb:hover,
  *::-webkit-scrollbar-thumb:hover {
    background: ${BrandColors.primary};
  }
  html,
  body,
  * {
    scrollbar-width: thin;
    scrollbar-color: ${BrandColors.secondary} ${BrandColors.tertiary};
  }
`;
import { LandingSplash } from '@landing/presentation/components/landing-splash';
import { CustomCursor } from '@landing/presentation/components/custom-cursor';
import { AuthProvider } from '@/shared/firebase/auth-context';
import { BanProvider, useBan } from '@/shared/identity/ban-context';
import { BlockScreen } from '@/shared/components/block-screen';
import { ConnectivityProvider } from '@/shared/offline/connectivity-context';
import { SyncProvider } from '@/shared/offline/sync-context';
import { PreferencesProvider } from '@/shared/settings/preferences';

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

function BanGate({ children }: React.PropsWithChildren) {
  const { verdict, reason } = useBan();

  if (verdict === 'checking') return null;
  if (verdict !== 'ok') return <BlockScreen verdict={verdict} reason={reason} />;
  return <>{children}</>;
}

export default function RootLayout() {
  const pathname = usePathname();
  const initialPathRef = useRef<string | null>(pathname);
  const [splashInitialPath] = useState<string | null>(() => initialPathRef.current);
  const isLandingPath = LANDING_PATHS.has(pathname);

  useLayoutEffect(() => {
    if (Platform.OS !== 'web') return;
    if (document.getElementById('app-scrollbar')) return;
    const style = document.createElement('style');
    style.id = 'app-scrollbar';
    style.textContent = SCROLLBAR_CSS;
    document.head.appendChild(style);
  }, []);

  return (
    <ThemeProvider value={AppLightTheme}>
      <AuthProvider>
        <BanProvider>
          <BanGate>
            <ConnectivityProvider>
              <SyncProvider>
                <PreferencesProvider>
                  {Platform.OS === 'web' ? (
                    <View style={styles.webRoot}>
                      {isLandingPath && <CustomCursor />}
                      <SplashGate initialPath={splashInitialPath} />
                      <Slot />
                    </View>
                  ) : (
                    <Stack screenOptions={{ headerShown: false }} />
                  )}
                </PreferencesProvider>
              </SyncProvider>
            </ConnectivityProvider>
          </BanGate>
        </BanProvider>
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
