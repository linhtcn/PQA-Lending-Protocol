import { useCallback, useMemo } from 'react';
import { parseUnits } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import type { TransactionState } from '../types';
import SimpleLendingABI from '../abis/SimpleLending.json';

interface UseLendingActionsResult {
  transaction: TransactionState;
  supply: (amount: string) => Promise<boolean>;
  withdraw: (amount: string) => Promise<boolean>;
  borrow: (amount: string) => Promise<boolean>;
  repay: (amount: string) => Promise<boolean>;
  resetTransaction: () => void;
}

function normalizeError(err: unknown): string {
  const obj = err as { code?: number; message?: string; shortMessage?: string; reason?: string };
  if (obj?.code === 4001) return 'Transaction rejected by user';
  const msg = obj?.shortMessage ?? obj?.reason ?? obj?.message;
  if (typeof msg !== 'string') return 'Transaction failed';
  if (msg.includes('Insufficient balance')) return 'Insufficient balance';
  if (msg.includes('Insufficient allowance') || msg.includes('allowance')) return 'Insufficient allowance. Please approve first.';
  if (msg.includes('Exceeds borrowing limit')) return 'Amount exceeds your borrowing limit';
  if (msg.includes('Insufficient liquidity')) return 'Insufficient liquidity in the pool';
  if (msg.includes('unhealthy')) return 'Withdrawal would make your position unhealthy';
  if (msg.includes('Insufficient supply')) return 'Insufficient supplied amount';
  if (msg.includes('Amount exceeds borrow') || msg.includes('exceeds')) return 'Amount exceeds your borrowed amount';
  return msg.slice(0, 100);
}

export function useLendingActions(lendingAddress: `0x${string}` | null): UseLendingActionsResult {
  const {
    writeContractAsync,
    data: txHash,
    isPending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const { isSuccess: receiptSuccess, isError: receiptError } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const transaction: TransactionState = useMemo(() => {
    if (writeError) {
      return { status: 'failed', hash: null, error: normalizeError(writeError) };
    }
    if (isPending && !txHash) return { status: 'pending', hash: null, error: null };
    if (txHash && !receiptSuccess && !receiptError) return { status: 'confirming', hash: txHash, error: null };
    if (receiptSuccess && txHash) return { status: 'confirmed', hash: txHash, error: null };
    if (receiptError) return { status: 'failed', hash: txHash ?? null, error: 'Transaction failed' };
    return { status: 'idle', hash: null, error: null };
  }, [isPending, txHash, receiptSuccess, receiptError, writeError]);

  const execute = useCallback(
    async (functionName: 'supply' | 'withdraw' | 'borrow' | 'repay', amount: string): Promise<boolean> => {
      if (!lendingAddress) return false;
      try {
        const parsed = parseUnits(amount, 18);
        await writeContractAsync({
          address: lendingAddress,
          abi: SimpleLendingABI as readonly unknown[],
          functionName,
          args: [parsed],
        });
        return true;
      } catch {
        return false;
      }
    },
    [lendingAddress, writeContractAsync]
  );

  const resetTransaction = useCallback(() => resetWrite(), [resetWrite]);

  return {
    transaction,
    supply: (amount: string) => execute('supply', amount),
    withdraw: (amount: string) => execute('withdraw', amount),
    borrow: (amount: string) => execute('borrow', amount),
    repay: (amount: string) => execute('repay', amount),
    resetTransaction,
  };
}
