import { useState, useEffect, useCallback, useRef } from 'react';
import { Contract } from 'ethers';
import { UserPosition } from '../types';

interface UseUserPositionResult {
  position: UserPosition | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const defaultPosition: UserPosition = {
  supplied: 0n,
  borrowed: 0n,
  collateralValue: 0n,
  healthFactor: 0n,
  maxWithdraw: 0n,
  maxBorrow: 0n,
};

export function useUserPosition(
  lendingContract: Contract | null,
  userAddress: string | null
): UseUserPositionResult {
  const [position, setPosition] = useState<UserPosition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnce = useRef(false);

  const fetchPosition = useCallback(async () => {
    if (!lendingContract || !userAddress) {
      hasLoadedOnce.current = false;
      setPosition(null);
      return;
    }

    // Only show loading on initial load; refetches keep previous data visible (no flicker)
    if (!hasLoadedOnce.current) setIsLoading(true);
    setError(null);

    try {
      const positionResult = await lendingContract.getUserPosition(userAddress);
      const maxWithdraw = await lendingContract.calculateMaxWithdraw(userAddress);
      const maxBorrow = await lendingContract.calculateMaxBorrow(userAddress);

      hasLoadedOnce.current = true;
      setPosition({
        supplied: positionResult[0],
        borrowed: positionResult[1],
        collateralValue: positionResult[2],
        healthFactor: positionResult[3],
        maxWithdraw,
        maxBorrow,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch user position';
      setError(message);
      setPosition(defaultPosition);
    } finally {
      setIsLoading(false);
    }
  }, [lendingContract, userAddress]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchPosition();
  }, [fetchPosition]);

  // Listen for user-specific events
  useEffect(() => {
    if (!lendingContract || !userAddress) return;

    const handleUpdate = () => {
      fetchPosition();
    };

    // Create filters for user-specific events
    const suppliedFilter = lendingContract.filters.Supplied(userAddress);
    const withdrawnFilter = lendingContract.filters.Withdrawn(userAddress);
    const borrowedFilter = lendingContract.filters.Borrowed(userAddress);
    const repaidFilter = lendingContract.filters.Repaid(userAddress);

    lendingContract.on(suppliedFilter, handleUpdate);
    lendingContract.on(withdrawnFilter, handleUpdate);
    lendingContract.on(borrowedFilter, handleUpdate);
    lendingContract.on(repaidFilter, handleUpdate);

    return () => {
      lendingContract.off(suppliedFilter, handleUpdate);
      lendingContract.off(withdrawnFilter, handleUpdate);
      lendingContract.off(borrowedFilter, handleUpdate);
      lendingContract.off(repaidFilter, handleUpdate);
    };
  }, [lendingContract, userAddress, fetchPosition]);

  return {
    position,
    isLoading,
    error,
    refetch: fetchPosition,
  };
}
