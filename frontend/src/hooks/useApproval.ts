import { useState, useEffect, useCallback } from 'react';
import { Contract, BrowserProvider } from 'ethers';
import { ApprovalState, TransactionState } from '../types';
import { MAX_UINT256 } from '../constants';

interface UseApprovalResult {
  allowance: bigint;
  approvalState: ApprovalState;
  transaction: TransactionState;
  approve: () => Promise<boolean>;
  refetch: () => Promise<void>;
  isApproved: (amount: bigint) => boolean;
}

export function useApproval(
  tokenContract: Contract | null,
  spenderAddress: string | null,
  ownerAddress: string | null,
  provider: BrowserProvider | null
): UseApprovalResult {
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [approvalState, setApprovalState] = useState<ApprovalState>('unknown');
  const [transaction, setTransaction] = useState<TransactionState>({
    status: 'idle',
    hash: null,
    error: null,
  });

  const fetchAllowance = useCallback(async () => {
    if (!tokenContract || !spenderAddress || !ownerAddress) {
      setAllowance(0n);
      setApprovalState('unknown');
      return;
    }

    setApprovalState('checking');

    try {
      const currentAllowance: bigint = await tokenContract.allowance(
        ownerAddress,
        spenderAddress
      );
      setAllowance(currentAllowance);
      setApprovalState(currentAllowance > 0n ? 'approved' : 'not_approved');
    } catch {
      setApprovalState('unknown');
    }
  }, [tokenContract, spenderAddress, ownerAddress]);

  const approve = useCallback(async (): Promise<boolean> => {
    if (!tokenContract || !spenderAddress || !provider) {
      return false;
    }

    setApprovalState('approving');
    setTransaction({ status: 'pending', hash: null, error: null });

    try {
      const signer = await provider.getSigner();
      const tokenWithSigner = tokenContract.connect(signer) as Contract;

      const tx = await tokenWithSigner.approve(spenderAddress, MAX_UINT256);
      setTransaction({ status: 'confirming', hash: tx.hash, error: null });

      await tx.wait();
      setTransaction({ status: 'confirmed', hash: tx.hash, error: null });
      setAllowance(MAX_UINT256);
      setApprovalState('approved');
      return true;
    } catch (err: unknown) {
      const error = err as { code?: number; reason?: string; message?: string };
      let message = 'Approval failed';

      if (error.code === 4001) {
        message = 'Transaction rejected by user';
      } else if (error.reason) {
        message = error.reason;
      } else if (error.message) {
        // Truncate very long error messages so we don't show raw objects/JSON
        message = error.message.slice(0, 100);
      }

      setTransaction({ status: 'failed', hash: null, error: message });
      setApprovalState('not_approved');
      return false;
    }
  }, [tokenContract, spenderAddress, provider]);

  const isApproved = useCallback(
    (amount: bigint): boolean => {
      return allowance >= amount;
    },
    [allowance]
  );

  // Fetch allowance on mount
  useEffect(() => {
    fetchAllowance();
  }, [fetchAllowance]);

  // Listen for Approval events
  useEffect(() => {
    if (!tokenContract || !ownerAddress || !spenderAddress) return;

    const filter = tokenContract.filters.Approval(ownerAddress, spenderAddress);

    const handleApproval = () => {
      fetchAllowance();
    };

    tokenContract.on(filter, handleApproval);

    return () => {
      tokenContract.off(filter, handleApproval);
    };
  }, [tokenContract, ownerAddress, spenderAddress, fetchAllowance]);

  return {
    allowance,
    approvalState,
    transaction,
    approve,
    refetch: fetchAllowance,
    isApproved,
  };
}
