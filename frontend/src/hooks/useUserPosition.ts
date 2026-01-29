import { useMemo } from 'react';
import { useReadContracts, useWatchContractEvent } from 'wagmi';
import type { UserPosition } from '../types';
import SimpleLendingABI from '../abis/SimpleLending.json';

interface UseUserPositionResult {
  position: UserPosition | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
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
  lendingAddress: `0x${string}` | null,
  userAddress: string | null
): UseUserPositionResult {
  const userArg = userAddress ? (userAddress as `0x${string}`) : undefined;

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: [
      {
        address: lendingAddress ?? undefined,
        abi: SimpleLendingABI as readonly unknown[],
        functionName: 'getUserPosition',
        args: userArg ? [userArg] : undefined,
      },
      {
        address: lendingAddress ?? undefined,
        abi: SimpleLendingABI as readonly unknown[],
        functionName: 'calculateMaxWithdraw',
        args: userArg ? [userArg] : undefined,
      },
      {
        address: lendingAddress ?? undefined,
        abi: SimpleLendingABI as readonly unknown[],
        functionName: 'calculateMaxBorrow',
        args: userArg ? [userArg] : undefined,
      },
    ],
  });

  useWatchContractEvent({
    address: lendingAddress ?? undefined,
    abi: SimpleLendingABI as readonly unknown[],
    eventName: 'Supplied',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    onLogs: () => refetch(),
  });
  useWatchContractEvent({
    address: lendingAddress ?? undefined,
    abi: SimpleLendingABI as readonly unknown[],
    eventName: 'Withdrawn',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    onLogs: () => refetch(),
  });
  useWatchContractEvent({
    address: lendingAddress ?? undefined,
    abi: SimpleLendingABI as readonly unknown[],
    eventName: 'Borrowed',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    onLogs: () => refetch(),
  });
  useWatchContractEvent({
    address: lendingAddress ?? undefined,
    abi: SimpleLendingABI as readonly unknown[],
    eventName: 'Repaid',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    onLogs: () => refetch(),
  });

  const position = useMemo<UserPosition | null>(() => {
    const pos = data?.[0]?.result;
    const maxWithdraw = data?.[1]?.result;
    const maxBorrow = data?.[2]?.result;
    if (!pos || !Array.isArray(pos)) return null;
    return {
      supplied: pos[0] as bigint,
      borrowed: pos[1] as bigint,
      collateralValue: pos[2] as bigint,
      healthFactor: pos[3] as bigint,
      maxWithdraw: (maxWithdraw as bigint) ?? 0n,
      maxBorrow: (maxBorrow as bigint) ?? 0n,
    };
  }, [data]);

  return {
    position: position ?? (error ? defaultPosition : null),
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
