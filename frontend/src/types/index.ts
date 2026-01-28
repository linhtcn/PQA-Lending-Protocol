import { BrowserProvider, Contract } from 'ethers';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  provider: BrowserProvider | null;
  isConnecting: boolean;
  error: string | null;
}

export interface TokenBalance {
  raw: bigint;
  formatted: string;
  symbol: string;
}

export interface PoolInfo {
  totalSupply: bigint;
  totalBorrow: bigint;
  utilizationRate: bigint;
  supplyRate: bigint;
  borrowRate: bigint;
}

export interface UserPosition {
  supplied: bigint;
  borrowed: bigint;
  collateralValue: bigint;
  healthFactor: bigint;
  maxWithdraw: bigint;
  maxBorrow: bigint;
}

export type TransactionStatus = 'idle' | 'pending' | 'confirming' | 'confirmed' | 'failed';

export interface TransactionState {
  status: TransactionStatus;
  hash: string | null;
  error: string | null;
}

export type ApprovalState = 'unknown' | 'checking' | 'not_approved' | 'approving' | 'approved';

export interface Contracts {
  usd8: Contract | null;
  weth: Contract | null;
  simpleLending: Contract | null;
}

export interface DeploymentInfo {
  network: string;
  chainId: number;
  contracts: {
    USD8: string;
    WETH: string;
    SimpleLending: string;
  };
  deployedAt: string;
}

declare module '*.css';
