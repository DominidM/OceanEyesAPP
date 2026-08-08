export const ARBITRUM_SEPOLIA = {
  chainId: 421614,
  rpc: 'https://sepolia-rollup.arbitrum.io/rpc',
  explorer: 'https://sepolia.arbiscan.io',
} as const;

export const POINT_LEDGER_ADDRESS = process.env.EXPO_PUBLIC_POINT_LEDGER_ADDRESS ?? '';

export function isPointLedgerConfigured(): boolean {
  return POINT_LEDGER_ADDRESS.length > 0;
}
