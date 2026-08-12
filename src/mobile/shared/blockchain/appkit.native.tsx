import '@walletconnect/react-native-compat';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EthersAdapter } from '@reown/appkit-ethers-react-native';
import {
  AppKit,
  AppKitProvider,
  createAppKit,
  useAccount,
  useAppKit,
  useAppKitState,
  type AppKitNetwork,
  type Storage,
} from '@reown/appkit-react-native';
import React from 'react';
import { View } from 'react-native';

const projectId = process.env.EXPO_PUBLIC_REOWN_PROJECT_ID ?? '';
// Version the namespace so incomplete sessions from older WalletConnect builds
// cannot be restored after an upgrade.
const storagePrefix = '@oceaneyes/appkit/v3/';

const storage: Storage = {
  async getKeys() {
    const keys = await AsyncStorage.getAllKeys();
    return keys.filter((key) => key.startsWith(storagePrefix)).map((key) => key.slice(storagePrefix.length));
  },
  async getEntries<T>() {
    const keys = await this.getKeys();
    const entries = await AsyncStorage.multiGet(keys.map((key) => `${storagePrefix}${key}`));
    return entries.flatMap(([key, value]) => {
      if (value == null) return [];
      try {
        return [[key.slice(storagePrefix.length), JSON.parse(value) as T] as [string, T]];
      } catch {
        return [];
      }
    });
  },
  async getItem<T>(key: string) {
    const value = await AsyncStorage.getItem(`${storagePrefix}${key}`);
    if (value == null) return undefined;
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  },
  async setItem<T>(key: string, value: T) {
    await AsyncStorage.setItem(`${storagePrefix}${key}`, JSON.stringify(value));
  },
  async removeItem(key: string) {
    await AsyncStorage.removeItem(`${storagePrefix}${key}`);
  },
};

const arbitrumSepolia: AppKitNetwork = {
  id: 421614,
  name: 'Arbitrum Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://sepolia-rollup.arbitrum.io/rpc'] } },
  blockExplorers: { default: { name: 'Arbiscan', url: 'https://sepolia.arbiscan.io' } },
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:421614',
  testnet: true,
};

export const appKit = createAppKit({
  projectId,
  adapters: [new EthersAdapter()],
  networks: [arbitrumSepolia],
  defaultNetwork: arbitrumSepolia,
  storage,
  metadata: {
    name: 'OceanEyes',
    description: 'Reportes y recompensas por la protección del océano',
    url: 'https://ocean-eyes.solvegrades.workers.dev',
    icons: ['https://ocean-eyes.solvegrades.workers.dev/favicon.ico'],
    redirect: {
      native: 'oceaneyes://',
    },
  },
  features: { socials: false, swaps: false, onramp: false },
  themeMode: 'light',
});

export function MobileWalletProvider({ children }: React.PropsWithChildren) {
  return <AppKitProvider instance={appKit}>{children}</AppKitProvider>;
}

export function MobileWalletModal() {
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', height: '100%', width: '100%' }}>
      <AppKit />
    </View>
  );
}

export function useMobileWallet() {
  const { open, disconnect } = useAppKit();
  const { address, isConnected } = useAccount();
  const { isOpen, isLoading } = useAppKitState();

  return {
    address,
    isConnected,
    isOpen,
    isLoading,
    open: () => open({ view: 'Connect' }),
    disconnect: () => disconnect('eip155'),
  };
}
