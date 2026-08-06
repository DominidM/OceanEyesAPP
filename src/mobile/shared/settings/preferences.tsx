import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type AppPreferences = {
  notifyNear: boolean;
  notifyStatus: boolean;
  reduceMotion: boolean;
  largeText: boolean;
};

const DEFAULTS: AppPreferences = {
  notifyNear: true,
  notifyStatus: true,
  reduceMotion: false,
  largeText: false,
};

const STORAGE_KEY = '@oceaneyes/settings/v1';

type PreferencesContextValue = AppPreferences & {
  loaded: boolean;
  setPreference: <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => Promise<void>;
};

const PreferencesContext = createContext<PreferencesContextValue>({
  ...DEFAULTS,
  loaded: false,
  setPreference: async () => undefined,
});

export function PreferencesProvider({ children }: React.PropsWithChildren) {
  const [prefs, setPrefs] = useState<AppPreferences>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setPrefs({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<AppPreferences>) });
      } catch {
        /* ignore */
      }
      setLoaded(true);
    })();
  }, []);

  const setPreference = useCallback(async <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({ ...prefs, loaded, setPreference }),
    [prefs, loaded, setPreference],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
