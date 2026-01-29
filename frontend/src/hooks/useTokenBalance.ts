import { useMemo } from 'react';
import { useReadContract, useWatchContractEvent } from 'wagmi';
import type { TokenBalance } from '../types';
import { formatTokenAmount } from '../utils/format';
import TestTokenABI from '../abis/TestToken.json';

interface UseTokenBalanceResult {
  balance: TokenBalance | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTokenBalance(
  tokenAddress: `0x${string}` | null,
  userAddress: string | null,
  symbol: string
): UseTokenBalanceResult {
  const { data, isLoading, error, refetch } = useReadContract({
    address: tokenAddress ?? undefined,
    abi: TestTokenABI as readonly unknown[],
    functionName: 'balanceOf',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
  });

  useWatchContractEvent({
    address: tokenAddress ?? undefined,
    abi: TestTokenABI as readonly unknown[],
    eventName: 'Transfer',
    onLogs: () => refetch(),
  });

  const balance = useMemo<TokenBalance | null>(() => {
    if (data === undefined) return null;
    const raw = data as bigint;
    return {
      raw,
      formatted: formatTokenAmount(raw),
      symbol,
    };
  }, [data, symbol]);

  return {
    balance,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
