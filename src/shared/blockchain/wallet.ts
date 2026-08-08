import { BrowserProvider, type Eip1193Provider } from 'ethers';

import { ARBITRUM_SEPOLIA } from './config';

type EthereumWindow = typeof window & { ethereum?: Eip1193Provider };

export type WalletErrorCode = 'NO_PROVIDER' | 'USER_REJECTED' | 'WRONG_NETWORK' | 'UNAVAILABLE';

export class WalletError extends Error {
  constructor(
    public readonly code: WalletErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'WalletError';
  }
}

export function getInjectedProvider(): Eip1193Provider | null {
  if (typeof window === 'undefined') return null;
  return (window as EthereumWindow).ethereum ?? null;
}

export function isWalletInstalled(): boolean {
  return getInjectedProvider() !== null;
}

export async function connectWallet(): Promise<string> {
  const provider = getInjectedProvider();
  if (!provider) throw new WalletError('NO_PROVIDER', 'MetaMask no está instalado.');
  try {
    const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
    if (!accounts?.length) throw new WalletError('UNAVAILABLE', 'No se obtuvo ninguna cuenta.');
    return accounts[0];
  } catch (error) {
    throw toWalletError(error, 'UNAVAILABLE');
  }
}

export async function getChainId(): Promise<number> {
  const provider = getInjectedProvider();
  if (!provider) throw new WalletError('NO_PROVIDER', 'MetaMask no está instalado.');
  const chainId = (await provider.request({ method: 'eth_chainId' })) as string;
  return Number.parseInt(chainId, 16);
}

export async function isOnArbitrumSepolia(): Promise<boolean> {
  return (await getChainId()) === ARBITRUM_SEPOLIA.chainId;
}

export async function switchToArbitrumSepolia(): Promise<void> {
  const provider = getInjectedProvider();
  if (!provider) throw new WalletError('NO_PROVIDER', 'MetaMask no está instalado.');

  const chainIdHex = `0x${ARBITRUM_SEPOLIA.chainId.toString(16)}`;
  try {
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chainIdHex }] });
  } catch (error) {
    if (isUserRejected(error)) throw toWalletError(error, 'USER_REJECTED');
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: chainIdHex,
          chainName: 'Arbitrum Sepolia',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: [ARBITRUM_SEPOLIA.rpc],
          blockExplorerUrls: [ARBITRUM_SEPOLIA.explorer],
        },
      ],
    });
  }
}

export async function getBrowserSigner() {
  const provider = getInjectedProvider();
  if (!provider) throw new WalletError('NO_PROVIDER', 'MetaMask no está instalado.');
  const browserProvider = new BrowserProvider(provider);
  return browserProvider.getSigner();
}

function isUserRejected(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 4001;
}

function toWalletError(error: unknown, fallback: WalletErrorCode): WalletError {
  if (error instanceof WalletError) return error;
  if (isUserRejected(error)) return new WalletError('USER_REJECTED', 'Solicitud rechazada por el usuario.');
  return new WalletError(fallback, 'No se pudo completar la operación con la wallet.');
}
