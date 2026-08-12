import React from 'react';

export function MobileWalletProvider({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

export function MobileWalletModal() {
  return null;
}

export function useMobileWallet() {
  return {
    address: undefined as string | undefined,
    isConnected: false,
    isOpen: false,
    isLoading: false,
    open: () => undefined,
    disconnect: () => undefined,
  };
}
