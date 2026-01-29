import { useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useContractAddresses } from '../hooks/useContracts';
import { useTokenBalance } from '../hooks/useTokenBalance';
import { useApproval } from '../hooks/useApproval';
import { usePoolInfo } from '../hooks/usePoolInfo';
import { useUserPosition } from '../hooks/useUserPosition';
import { useLendingActions } from '../hooks/useLendingActions';
import { PoolInfoSummary } from '../components/PoolInfoSummary';
import { UserPositionCard } from '../components/UserPositionCard';
import { TransactionForm } from '../components/TransactionForm';
import { useToast } from '../components/ToastProvider';

export function Lending() {
  const wallet = useWallet();
  const addresses = useContractAddresses();
  const usd8Addr = addresses.USD8 as `0x${string}`;
  const lendingAddr = addresses.SimpleLending as `0x${string}`;

  const usd8Balance = useTokenBalance(usd8Addr, wallet.address, 'USD8');
  const approval = useApproval(usd8Addr, lendingAddr, wallet.address);
  const poolInfo = usePoolInfo(lendingAddr);
  const userPosition = useUserPosition(lendingAddr, wallet.address);
  const lendingActions = useLendingActions(lendingAddr);
  const { showToast } = useToast();

  useEffect(() => {
    const { status, error } = approval.transaction;
    if (status === 'failed' && error) {
      showToast(error, 'error');
    } else if (status === 'confirmed') {
      showToast('Approval successful', 'success');
    }
  }, [approval.transaction, showToast]);

  useEffect(() => {
    const { status, error } = lendingActions.transaction;
    if (status === 'failed' && error) {
      showToast(error, 'error');
    } else if (status === 'confirmed') {
      showToast('Transaction confirmed', 'success');
    }
  }, [lendingActions.transaction, showToast]);

  const handleTransactionSuccess = () => {
    usd8Balance.refetch();
    poolInfo.refetch();
    userPosition.refetch();
  };

  const wrappedSupply = async (amount: string) => {
    const success = await lendingActions.supply(amount);
    if (success) handleTransactionSuccess();
    return success;
  };

  const wrappedWithdraw = async (amount: string) => {
    const success = await lendingActions.withdraw(amount);
    if (success) handleTransactionSuccess();
    return success;
  };

  const wrappedBorrow = async (amount: string) => {
    const success = await lendingActions.borrow(amount);
    if (success) handleTransactionSuccess();
    return success;
  };

  const wrappedRepay = async (amount: string) => {
    const success = await lendingActions.repay(amount);
    if (success) handleTransactionSuccess();
    return success;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-white md:text-3xl">Lending</h1>
        <p className="text-slate-400">Supply, withdraw, borrow, and repay USD8</p>
      </div>

      {/* Pool Information (single source at top) */}
      <PoolInfoSummary poolInfo={poolInfo.poolInfo} isLoading={poolInfo.isLoading} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr),minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <UserPositionCard position={userPosition.position} isLoading={userPosition.isLoading} />
        </div>
        <div className="flex flex-col gap-6">
          <TransactionForm
            balance={usd8Balance.balance}
            position={userPosition.position}
            poolInfo={poolInfo.poolInfo}
            approvalState={approval.approvalState}
            approvalTransaction={approval.transaction}
            actionTransaction={lendingActions.transaction}
            onApprove={approval.approve}
            onSupply={wrappedSupply}
            onWithdraw={wrappedWithdraw}
            onBorrow={wrappedBorrow}
            onRepay={wrappedRepay}
            onResetTransaction={lendingActions.resetTransaction}
            isApproved={approval.isApproved}
          />
        </div>
      </div>
    </div>
  );
}
