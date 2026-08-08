import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import type { Signer } from 'ethers';

import { ARBITRUM_SEPOLIA } from '@shared/blockchain/config';
import {
  WalletError,
  connectWallet,
  getAuthorizedAccounts,
  getBrowserSigner,
  getChainId,
  isWalletInstalled,
  offWalletEvent,
  onWalletEvent,
  switchToArbitrumSepolia,
} from '@shared/blockchain/wallet';

type WalletState = {
  account: string | null;
  signer: Signer | null;
  chainId: number | null;
  connecting: boolean;
  error: string | null;
  installed: boolean;
  onArbitrumSepolia: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
};

const WalletContext = createContext<WalletState | null>(null);

const WALLET_STORAGE_KEY = 'oceaneyes.admin.wallet';

function readStoredAccount(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(WALLET_STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistAccount(address: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (address) {
      window.localStorage.setItem(WALLET_STORAGE_KEY, address);
    } else {
      window.localStorage.removeItem(WALLET_STORAGE_KEY);
    }
  } catch {
  }
}

export function WalletProvider({ children }: PropsWithChildren) {
  const [account, setAccount] = useState<string | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const installed = isWalletInstalled();
  const onArbitrumSepolia = chainId === ARBITRUM_SEPOLIA.chainId;

  const refreshChainId = useCallback(async () => {
    try {
      setChainId(await getChainId());
    } catch {
      setChainId(null);
    }
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const address = await connectWallet();
      setAccount(address);
      setSigner(await getBrowserSigner());
      persistAccount(address);
      await refreshChainId();
    } catch (e) {
      setError(e instanceof WalletError ? e.message : 'No se pudo conectar la wallet.');
    } finally {
      setConnecting(false);
    }
  }, [refreshChainId]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setSigner(null);
    setChainId(null);
    setError(null);
    persistAccount(null);
  }, []);

  const switchNetwork = useCallback(async () => {
    setError(null);
    try {
      await switchToArbitrumSepolia();
      await refreshChainId();
    } catch (e) {
      setError(e instanceof WalletError ? e.message : 'No se pudo cambiar de red.');
    }
  }, [refreshChainId]);

  useEffect(() => {
    refreshChainId();
  }, [refreshChainId]);

  useEffect(() => {
    const stored = readStoredAccount();

    let cancelled = false;
    const restore = async () => {
      if (!stored) return;
      try {
        const accounts = await getAuthorizedAccounts();
        if (cancelled) return;
        const address = accounts.find((a) => a.toLowerCase() === stored.toLowerCase());
        if (!address) {
          persistAccount(null);
          return;
        }
        setAccount(address);
        setSigner(await getBrowserSigner());
        await refreshChainId();
      } catch {
        persistAccount(null);
      }
    };
    restore();

    const handleAccountsChanged = (accounts: unknown) => {
      const list = Array.isArray(accounts) ? (accounts as string[]) : [];
      if (list.length === 0) {
        setAccount(null);
        setSigner(null);
        persistAccount(null);
        return;
      }
      const address = list[0];
      setAccount(address);
      persistAccount(address);
      refreshChainId();
      getBrowserSigner()
        .then(setSigner)
        .catch(() => setSigner(null));
    };

    const handleChainChanged = () => {
      refreshChainId();
    };

    onWalletEvent('accountsChanged', handleAccountsChanged);
    onWalletEvent('chainChanged', handleChainChanged);

    return () => {
      cancelled = true;
      offWalletEvent('accountsChanged', handleAccountsChanged);
      offWalletEvent('chainChanged', handleChainChanged);
    };
  }, [refreshChainId]);

  const value = useMemo<WalletState>(
    () => ({
      account,
      signer,
      chainId,
      connecting,
      error,
      installed,
      onArbitrumSepolia,
      connect,
      disconnect,
      switchNetwork,
    }),
    [account, signer, chainId, connecting, error, installed, onArbitrumSepolia, connect, disconnect, switchNetwork],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet debe usarse dentro de WalletProvider.');
  return ctx;
}
