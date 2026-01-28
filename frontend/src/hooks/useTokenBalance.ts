import { useState, useEffect, useCallback, useRef } from 'react';
import { Contract } from 'ethers';
import { TokenBalance } from '../types';
import { formatTokenAmount } from '../utils/format';

interface UseTokenBalanceResult {
  balance: TokenBalance | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTokenBalance(
  tokenContract: Contract | null,
  userAddress: string | null,
  symbol: string
): UseTokenBalanceResult {
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);

  const fetchBalance = useCallback(async () => {
    if (!tokenContract || !userAddress) {
      hasLoadedOnce.current = false;
      setBalance(null);
      return;
    }

    // Only show loading on initial load; refetches keep previous data visible (no flicker)
    if (!hasLoadedOnce.current) setIsLoading(true);
    setError(null);

    try {
      const rawBalance: bigint = await tokenContract.balanceOf(userAddress);
      hasLoadedOnce.current = true;
      setBalance({
        raw: rawBalance,
        formatted: formatTokenAmount(rawBalance),
        symbol,
      });
    } catch (err: unknown) {
      let message = 'Failed to fetch balance';
      if (err instanceof Error) {
        const match = err.message.match(/^([^(]+)/);
        message = match ? match[1].trim() : err.message;
      }
      setError(message);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [tokenContract, userAddress, symbol]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Listen for Transfer events
  useEffect(() => {
    if (!tokenContract || !userAddress) return;

    const filterTo = tokenContract.filters.Transfer(null, userAddress);
    const filterFrom = tokenContract.filters.Transfer(userAddress, null);

    const handleTransfer = () => {
      fetchBalance();
    };

    tokenContract.on(filterTo, handleTransfer);
    tokenContract.on(filterFrom, handleTransfer);

    return () => {
      tokenContract.off(filterTo, handleTransfer);
      tokenContract.off(filterFrom, handleTransfer);
    };
  }, [tokenContract, userAddress, fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}
