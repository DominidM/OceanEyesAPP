import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import type { Signer } from 'ethers';

import { ARBITRUM_SEPOLIA } from '@shared/blockchain/config';
import {
  WalletError,
  connectWallet,
  getBrowserSigner,
  getChainId,
  isWalletInstalled,
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
