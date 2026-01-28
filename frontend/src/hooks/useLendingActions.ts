import { useState, useCallback } from 'react';
import { Contract, BrowserProvider, parseUnits } from 'ethers';
import { TransactionState } from '../types';

interface UseLendingActionsResult {
  transaction: TransactionState;
  supply: (amount: string) => Promise<boolean>;
  withdraw: (amount: string) => Promise<boolean>;
  borrow: (amount: string) => Promise<boolean>;
  repay: (amount: string) => Promise<boolean>;
  resetTransaction: () => void;
}

export function useLendingActions(
  lendingContract: Contract | null,
  provider: BrowserProvider | null
): UseLendingActionsResult {
  const [transaction, setTransaction] = useState<TransactionState>({
    status: 'idle',
    hash: null,
    error: null,
  });

  const resetTransaction = useCallback(() => {
    setTransaction({ status: 'idle', hash: null, error: null });
  }, []);

  const executeTransaction = useCallback(
    async (
      method: string,
      amount: string
    ): Promise<boolean> => {
      if (!lendingContract || !provider) {
        setTransaction({
          status: 'failed',
          hash: null,
          error: 'Contracts not initialized',
        });
        return false;
      }

      setTransaction({ status: 'pending', hash: null, error: null });

      try {
        const signer = await provider.getSigner();
        const contractWithSigner = lendingContract.connect(signer) as Contract;
        const parsedAmount = parseUnits(amount, 18);

        const tx = await contractWithSigner[method](parsedAmount);
        setTransaction({ status: 'confirming', hash: tx.hash, error: null });

        await tx.wait();
        setTransaction({ status: 'confirmed', hash: tx.hash, error: null });
        return true;
      } catch (err: unknown) {
        const error = err as { code?: number; reason?: string; message?: string };
        let message = 'Transaction failed';

        if (error.code === 4001) {
          message = 'Transaction rejected by user';
        } else if (error.reason) {
          // Contract revert reason
          message = error.reason;
        } else if (error.message) {
          // Parse common error messages
          if (error.message.includes('Insufficient balance')) {
            message = 'Insufficient balance';
          } else if (error.message.includes('Insufficient allowance')) {
            message = 'Insufficient allowance. Please approve first.';
          } else if (error.message.includes('Exceeds borrowing limit')) {
            message = 'Amount exceeds your borrowing limit';
          } else if (error.message.includes('Insufficient liquidity')) {
            message = 'Insufficient liquidity in the pool';
          } else if (error.message.includes('unhealthy')) {
            message = 'Withdrawal would make your position unhealthy';
          } else if (error.message.includes('Insufficient supply')) {
            message = 'Insufficient supplied amount';
          } else if (error.message.includes('Amount exceeds borrow')) {
            message = 'Amount exceeds your borrowed amount';
          } else {
            message = error.message.slice(0, 100);
          }
        }

        setTransaction({ status: 'failed', hash: null, error: message });
        return false;
      }
    },
    [lendingContract, provider]
  );

  const supply = useCallback(
    (amount: string) => executeTransaction('supply', amount),
    [executeTransaction]
  );

  const withdraw = useCallback(
    (amount: string) => executeTransaction('withdraw', amount),
    [executeTransaction]
  );

  const borrow = useCallback(
    (amount: string) => executeTransaction('borrow', amount),
    [executeTransaction]
  );

  const repay = useCallback(
    (amount: string) => executeTransaction('repay', amount),
    [executeTransaction]
  );

  return {
    transaction,
    supply,
    withdraw,
    borrow,
    repay,
    resetTransaction,
  };
}
