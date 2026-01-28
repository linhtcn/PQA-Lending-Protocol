import { useState, useEffect, useCallback, useRef } from 'react';
import { Contract } from 'ethers';
import { PoolInfo } from '../types';

interface UsePoolInfoResult {
  poolInfo: PoolInfo | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const defaultPoolInfo: PoolInfo = {
  totalSupply: 0n,
  totalBorrow: 0n,
  utilizationRate: 0n,
  supplyRate: 0n,
  borrowRate: 0n,
};

export function usePoolInfo(
  lendingContract: Contract | null
): UsePoolInfoResult {
  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);

  const fetchPoolInfo = useCallback(async () => {
    if (!lendingContract) {
      hasLoadedOnce.current = false;
      setPoolInfo(null);
      return;
    }

    // Only show loading on initial load; refetches keep previous data visible (no flicker)
    if (!hasLoadedOnce.current) setIsLoading(true);
    setError(null);

    try {
      const result = await lendingContract.getPoolInfo();
      hasLoadedOnce.current = true;
      setPoolInfo({
        totalSupply: result[0],
        totalBorrow: result[1],
        utilizationRate: result[2],
        supplyRate: result[3],
        borrowRate: result[4],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch pool info';
      setError(message);
      setPoolInfo(defaultPoolInfo);
    } finally {
      setIsLoading(false);
    }
  }, [lendingContract]);

  // Fetch on mount
  useEffect(() => {
    fetchPoolInfo();
  }, [fetchPoolInfo]);

  // Listen for lending events
  useEffect(() => {
    if (!lendingContract) return;

    const handleUpdate = () => {
      fetchPoolInfo();
    };

    // Listen to all relevant events
    lendingContract.on('Supplied', handleUpdate);
    lendingContract.on('Withdrawn', handleUpdate);
    lendingContract.on('Borrowed', handleUpdate);
    lendingContract.on('Repaid', handleUpdate);

    return () => {
      lendingContract.off('Supplied', handleUpdate);
      lendingContract.off('Withdrawn', handleUpdate);
      lendingContract.off('Borrowed', handleUpdate);
      lendingContract.off('Repaid', handleUpdate);
    };
  }, [lendingContract, fetchPoolInfo]);

  return {
    poolInfo,
    isLoading,
    error,
    refetch: fetchPoolInfo,
  };
}
