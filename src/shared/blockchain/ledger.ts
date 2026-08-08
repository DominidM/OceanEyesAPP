import { Contract, JsonRpcProvider, type Signer } from 'ethers';

import { ARBITRUM_SEPOLIA, isPointLedgerConfigured } from './config';
import { POINT_LEDGER_ABI } from './point-ledger.abi';

export class LedgerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LedgerError';
  }
}

function requireAddress(): string {
  if (!isPointLedgerConfigured()) {
    throw new LedgerError('El contrato PointLedger aún no está configurado (falta el deploy).');
  }
  return process.env.EXPO_PUBLIC_POINT_LEDGER_ADDRESS ?? '';
}

export function getLedgerContract(runner: Signer | JsonRpcProvider): Contract {
  return new Contract(requireAddress(), POINT_LEDGER_ABI, runner);
}

export function getPublicLedgerContract(): Contract {
  const provider = new JsonRpcProvider(ARBITRUM_SEPOLIA.rpc);
  return new Contract(requireAddress(), POINT_LEDGER_ABI, provider);
}

async function buildFeeOverrides(signer: Signer) {
  const provider = signer.provider;
  if (!provider) return {};
  const fee = await provider.getFeeData();
  const maxFeePerGas = fee.maxFeePerGas;
  if (!maxFeePerGas) return {};
  const maxPriorityFeePerGas = fee.maxPriorityFeePerGas ?? BigInt('1000000000');
  return { maxFeePerGas: maxFeePerGas * 2n, maxPriorityFeePerGas };
}

export async function awardPointsOnChain(params: {
  signer: Signer;
  reporter: string;
  reportId: string;
  category: string;
}): Promise<string> {
  const { signer, reporter, reportId, category } = params;
  const contract = getLedgerContract(signer);
  const overrides = await buildFeeOverrides(signer);
  const tx = await contract.awardPoints(reporter, reportId, category, overrides);
  await tx.wait();
  return tx.hash;
}

export async function getOnChainBalance(address: string): Promise<bigint> {
  const contract = getPublicLedgerContract();
  return (await contract.getBalance(address)) as bigint;
}

export async function isReportProcessedOnChain(reportId: string): Promise<boolean> {
  const contract = getPublicLedgerContract();
  return (await contract.isReportProcessed(reportId)) as boolean;
}

export function buildArbiscanTxUrl(txHash: string): string {
  return `${ARBITRUM_SEPOLIA.explorer}/tx/${txHash}`;
}

export function buildArbiscanAddressUrl(address: string): string {
  return `${ARBITRUM_SEPOLIA.explorer}/address/${address}`;
}
