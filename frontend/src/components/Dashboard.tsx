import { useEffect } from "react";
import { useWallet } from "../hooks/useWallet";
import { useContractAddresses } from "../hooks/useContracts";
import { useTokenBalance } from "../hooks/useTokenBalance";
import { useApproval } from "../hooks/useApproval";
import { usePoolInfo } from "../hooks/usePoolInfo";
import { useUserPosition } from "../hooks/useUserPosition";
import { useLendingActions } from "../hooks/useLendingActions";
import { WalletConnect } from "./WalletConnect";
import { NetworkStatus } from "./NetworkStatus";
import { TokenBalances } from "./TokenBalances";
import { PoolInfoCard } from "./PoolInfoCard";
import { UserPositionCard } from "./UserPositionCard";
import { TransactionForm } from "./TransactionForm";
import { useToast } from "./ToastProvider";

export function Dashboard() {
  const wallet = useWallet();
  const addresses = useContractAddresses();
  const usd8Addr = addresses.USD8 as `0x${string}`;
  const lendingAddr = addresses.SimpleLending as `0x${string}`;

  const usd8Balance = useTokenBalance(usd8Addr, wallet.address, "USD8");
  const wethBalance = useTokenBalance(addresses.WETH as `0x${string}`, wallet.address, "WETH");

  const approval = useApproval(usd8Addr, lendingAddr, wallet.address);

  const poolInfo = usePoolInfo(lendingAddr);
  const userPosition = useUserPosition(lendingAddr, wallet.address);

  const lendingActions = useLendingActions(lendingAddr);

  const { showToast } = useToast();

  // Global error handling via toasts (non-form errors)
  useEffect(() => {
    if (wallet.error) {
      showToast(wallet.error, "error");
    }
  }, [wallet.error, showToast]);

  // Approval transaction toasts
  useEffect(() => {
    const { status, error } = approval.transaction;
    if (status === "failed" && error) {
      showToast(error, "error");
    } else if (status === "confirmed") {
      showToast("Approval successful", "success");
    }
  }, [approval.transaction, showToast]);

  // Lending action transaction toasts
  useEffect(() => {
    const { status, error } = lendingActions.transaction;
    if (status === "failed" && error) {
      showToast(error, "error");
    } else if (status === "confirmed") {
      showToast("Transaction confirmed", "success");
    }
  }, [lendingActions.transaction, showToast]);

  // Refetch data after successful transactions
  const handleTransactionSuccess = () => {
    usd8Balance.refetch();
    poolInfo.refetch();
    userPosition.refetch();
  };

  // Wrap actions to refetch after success
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
    <div className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
            DeFi Lending Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <NetworkStatus
              chainId={wallet.chainId}
              isCorrectNetwork={wallet.isCorrectNetwork}
              onSwitchNetwork={wallet.switchToHardhat}
            />
            <WalletConnect
              isConnected={wallet.isConnected}
              address={wallet.address}
              isConnecting={wallet.isConnecting}
              error={wallet.error}
              onConnect={wallet.connect}
              onDisconnect={wallet.disconnect}
            />
          </div>
        </header>

        {!wallet.isConnected ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-16 text-center shadow-lg shadow-black/40">
            <h2 className="mb-3 text-2xl font-semibold">
              Welcome to DeFi Lending
            </h2>
            <p className="max-w-md text-slate-400">
              Connect your wallet to start supplying, borrowing, and earning on
              the SimpleLending pool.
            </p>
          </div>
        ) : !wallet.isCorrectNetwork ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-950/40 px-6 py-16 text-center shadow-lg shadow-black/40">
            <h2 className="mb-3 text-2xl font-semibold">Wrong Network</h2>
            <p className="mb-6 max-w-md text-amber-100/80">
              Please switch to the Hardhat Local network to continue.
            </p>
            <button
              onClick={wallet.switchToHardhat}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              Switch Network
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr),minmax(0,1fr)]">
            <div className="flex flex-col gap-6">
              <TokenBalances
                usd8Balance={usd8Balance.balance}
                wethBalance={wethBalance.balance}
                isLoading={usd8Balance.isLoading || wethBalance.isLoading}
              />
              <PoolInfoCard
                poolInfo={poolInfo.poolInfo}
                isLoading={poolInfo.isLoading}
              />
            </div>

            <div className="flex flex-col gap-6">
              <UserPositionCard
                position={userPosition.position}
                isLoading={userPosition.isLoading}
              />
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
        )}
      </div>
    </div>
  );
}
