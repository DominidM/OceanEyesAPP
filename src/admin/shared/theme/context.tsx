import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdminColors, AdminThemeMode, darkColors, lightColors } from './colors';

type AdminThemeContextValue = {
  mode: AdminThemeMode;
  colors: AdminColors;
  toggle: () => void;
};

const AdminThemeContext = createContext<AdminThemeContextValue>({
  mode: 'light',
  colors: lightColors,
  toggle: () => {},
});

export function AdminThemeProvider({ children }: React.PropsWithChildren) {
  const [mode, setMode] = useState<AdminThemeMode>('light');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('admin-theme') : null;
    if (stored === 'dark') setMode('dark');
  }, []);

  const toggle = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') window.localStorage.setItem('admin-theme', next);
      return next;
    });
  };

  const colors = mode === 'dark' ? darkColors : lightColors;

  return (
    <AdminThemeContext.Provider value={{ mode, colors, toggle }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}
