import { useMemo } from 'react';
import { useReadContract, useWatchContractEvent } from 'wagmi';
import type { PoolInfo } from '../types';
import SimpleLendingABI from '../abis/SimpleLending.json';

interface UsePoolInfoResult {
  poolInfo: PoolInfo | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const defaultPoolInfo: PoolInfo = {
  totalSupply: 0n,
  totalBorrow: 0n,
  utilizationRate: 0n,
  supplyRate: 0n,
  borrowRate: 0n,
};

export function usePoolInfo(lendingAddress: `0x${string}` | null): UsePoolInfoResult {
  const { data, isLoading, error, refetch } = useReadContract({
    address: lendingAddress ?? undefined,
    abi: SimpleLendingABI as readonly unknown[],
    functionName: 'getPoolInfo',
  });

  useWatchContractEvent({
    address: lendingAddress ?? undefined,
    abi: SimpleLendingABI as readonly unknown[],
    eventName: 'Supplied',
    onLogs: () => refetch(),
  });
  useWatchContractEvent({
    address: lendingAddress ?? undefined,
    abi: SimpleLendingABI as readonly unknown[],
    eventName: 'Withdrawn',
    onLogs: () => refetch(),
  });
  useWatchContractEvent({
    address: lendingAddress ?? undefined,
    abi: SimpleLendingABI as readonly unknown[],
    eventName: 'Borrowed',
    onLogs: () => refetch(),
  });
  useWatchContractEvent({
    address: lendingAddress ?? undefined,
    abi: SimpleLendingABI as readonly unknown[],
    eventName: 'Repaid',
    onLogs: () => refetch(),
  });

  const poolInfo = useMemo<PoolInfo | null>(() => {
    if (!data || !Array.isArray(data)) return null;
    return {
      totalSupply: data[0] as bigint,
      totalBorrow: data[1] as bigint,
      utilizationRate: data[2] as bigint,
      supplyRate: data[3] as bigint,
      borrowRate: data[4] as bigint,
    };
  }, [data]);
  console.log("🚀 ~ usePoolInfo ~ poolInfo:", poolInfo)

  return {
    poolInfo: poolInfo ?? (error ? defaultPoolInfo : null),
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}
