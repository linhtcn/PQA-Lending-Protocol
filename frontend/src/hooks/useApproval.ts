import { useCallback, useMemo } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
import type { ApprovalState, TransactionState } from '../types';
import { MAX_UINT256 } from '../constants';
import TestTokenABI from '../abis/TestToken.json';

interface UseApprovalResult {
  allowance: bigint;
  approvalState: ApprovalState;
  transaction: TransactionState;
  approve: () => Promise<boolean>;
  refetch: () => void;
  isApproved: (amount: bigint) => boolean;
}

export function useApproval(
  tokenAddress: `0x${string}` | null,
  spenderAddress: string | null,
  ownerAddress: string | null
): UseApprovalResult {
  const { data: allowanceData, refetch, isLoading: allowanceLoading } = useReadContract({
    address: tokenAddress ?? undefined,
    abi: TestTokenABI as readonly unknown[],
    functionName: 'allowance',
    args:
      ownerAddress && spenderAddress
        ? [ownerAddress as `0x${string}`, spenderAddress as `0x${string}`]
        : undefined,
  });

  const {
    writeContractAsync,
    data: txHash,
    isPending: isApprovePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const { isSuccess: receiptSuccess, isError: receiptError } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useWatchContractEvent({
    address: tokenAddress ?? undefined,
    abi: TestTokenABI as readonly unknown[],
    eventName: 'Approval',
    args: ownerAddress && spenderAddress ? [ownerAddress as `0x${string}`, spenderAddress as `0x${string}`] : undefined,
    onLogs: () => refetch(),
  });

  const allowance = (allowanceData as bigint) ?? 0n;

  const approvalState: ApprovalState = useMemo(() => {
    if (allowanceLoading) return 'checking';
    if (isApprovePending || (txHash && !receiptSuccess && !receiptError)) return 'approving';
    return allowance > 0n ? 'approved' : 'not_approved';
  }, [allowanceLoading, isApprovePending, txHash, receiptSuccess, receiptError, allowance]);

  const transaction: TransactionState = useMemo(() => {
    if (writeError) {
      const msg =
        (writeError as { message?: string }).message?.slice(0, 100) ?? 'Approval failed';
      return { status: 'failed', hash: null, error: msg };
    }
    if (isApprovePending && !txHash) return { status: 'pending', hash: null, error: null };
    if (txHash && !receiptSuccess && !receiptError) return { status: 'confirming', hash: txHash, error: null };
    if (receiptSuccess && txHash) return { status: 'confirmed', hash: txHash, error: null };
    if (receiptError) return { status: 'failed', hash: txHash ?? null, error: 'Transaction failed' };
    return { status: 'idle', hash: null, error: null };
  }, [isApprovePending, txHash, receiptSuccess, receiptError, writeError]);

  const approve = useCallback(async (): Promise<boolean> => {
    if (!tokenAddress || !spenderAddress) return false;
    resetWrite();
    try {
      await writeContractAsync({
        address: tokenAddress,
        abi: TestTokenABI as readonly unknown[],
        functionName: 'approve',
        args: [spenderAddress as `0x${string}`, MAX_UINT256],
      });
      return true;
    } catch (err: unknown) {
      return false;
    }
  }, [tokenAddress, spenderAddress, writeContractAsync, resetWrite]);

  const isApproved = useCallback(
    (amount: bigint): boolean => allowance >= amount,
    [allowance]
  );

  return {
    allowance,
    approvalState,
    transaction,
    approve,
    refetch,
    isApproved,
  };
}
