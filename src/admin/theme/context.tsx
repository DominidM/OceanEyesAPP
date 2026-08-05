import React, { createContext, useContext, useState } from 'react';
import { AdminColors, AdminThemeMode, darkColors, lightColors } from '@admin/config/admin-theme';

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

  const toggle = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
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
