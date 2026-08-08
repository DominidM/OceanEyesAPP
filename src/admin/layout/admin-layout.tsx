import { Slot } from 'expo-router';
import React from 'react';

import { AdminThemeProvider } from '@admin/theme/context';
import { WalletProvider } from '@admin/presentation/hooks/useWallet';

export function AdminLayout() {
  return (
    <AdminThemeProvider>
      <WalletProvider>
        <Slot />
      </WalletProvider>
    </AdminThemeProvider>
  );
}
