import { Slot } from 'expo-router';
import React from 'react';

import { AdminThemeProvider } from '@admin/theme/context';

export function AdminLayout() {
  return (
    <AdminThemeProvider>
      <Slot />
    </AdminThemeProvider>
  );
}
