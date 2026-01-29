import { useState, useCallback } from 'react';
import { parseUnits } from 'ethers';
import { TokenBalance, UserPosition, ApprovalState, TransactionState, PoolInfo } from '../types';
import { isValidAmount } from '../utils/validation';
import { formatTokenAmount } from '../utils/format';
// import { TransactionStatus } from './TransactionStatus';
import { ApprovalButton } from './ApprovalButton';

type ActionType = 'supply' | 'withdraw' | 'borrow' | 'repay';

interface TransactionFormProps {
  balance: TokenBalance | null;
  position: UserPosition | null;
  poolInfo: PoolInfo | null;
  approvalState: ApprovalState;
  approvalTransaction: TransactionState;
  actionTransaction: TransactionState;
  onApprove: () => void;
  onSupply: (amount: string) => Promise<boolean>;
  onWithdraw: (amount: string) => Promise<boolean>;
  onBorrow: (amount: string) => Promise<boolean>;
  onRepay: (amount: string) => Promise<boolean>;
  onResetTransaction: () => void;
  isApproved: (amount: bigint) => boolean;
}

export function TransactionForm({
  balance,
  position,
  poolInfo,
  approvalState,
  approvalTransaction,
  actionTransaction,
  onApprove,
  onSupply,
  onWithdraw,
  onBorrow,
  onRepay,
  onResetTransaction,
  isApproved,
}: TransactionFormProps) {
  const [activeTab, setActiveTab] = useState<ActionType>('supply');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const getMaxAmount = useCallback((): bigint => {
    if (!position || !balance) return 0n;

    switch (activeTab) {
      case 'supply':
        return balance.raw;
      case 'withdraw':
        return position.maxWithdraw;
      case 'borrow': {
        const poolLiquidity = poolInfo ? poolInfo.totalSupply - poolInfo.totalBorrow : undefined;
        const cap = poolLiquidity !== undefined && position.maxBorrow > poolLiquidity ? poolLiquidity : position.maxBorrow;
        return cap;
      }
      case 'repay':
        return position.borrowed < balance.raw ? position.borrowed : balance.raw;
      default:
        return 0n;
    }
  }, [activeTab, position, balance, poolInfo]);

  const handleMaxClick = useCallback(() => {
    const max = getMaxAmount();
    if (max > 0n) {
      const formatted = formatTokenAmount(max, 18, 18);
      setAmount(formatted.replace(/,/g, ''));
    }
  }, [getMaxAmount]);

  const validateAmount = useCallback(
    (value: string): string | null => {
      if (!isValidAmount(value)) {
        return 'Please enter a valid amount';
      }

      try {
        const parsedAmount = parseUnits(value, 18);
        const max = getMaxAmount();

        if (parsedAmount > max) {
          switch (activeTab) {
            case 'supply':
              return 'Insufficient balance';
            case 'withdraw':
              return 'Exceeds max withdrawable amount';
            case 'borrow':
              return 'Exceeds borrowing limit';
            case 'repay':
              return 'Exceeds borrowed amount or balance';
          }
        }

        // Check approval for supply and repay
        if ((activeTab === 'supply' || activeTab === 'repay') && !isApproved(parsedAmount)) {
          return 'Please approve USD8 first';
        }

        // Check pool liquidity for borrow
        if (activeTab === 'borrow' && poolInfo) {
          const liquidity = poolInfo.totalSupply - poolInfo.totalBorrow;
          if (parsedAmount > liquidity) {
            return 'Insufficient pool liquidity';
          }
        }

        return null;
      } catch {
        return 'Invalid amount format';
      }
    },
    [activeTab, getMaxAmount, isApproved, poolInfo]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const validationError = validateAmount(amount);
      if (validationError) {
        setError(validationError);
        return;
      }

      let success = false;
      switch (activeTab) {
        case 'supply':
          success = await onSupply(amount);
          break;
        case 'withdraw':
          success = await onWithdraw(amount);
          break;
        case 'borrow':
          success = await onBorrow(amount);
          break;
        case 'repay':
          success = await onRepay(amount);
          break;
      }

      if (success) {
        setAmount('');
      }
    },
    [activeTab, amount, validateAmount, onSupply, onWithdraw, onBorrow, onRepay]
  );

  const handleTabChange = (tab: ActionType) => {
    setActiveTab(tab);
    setAmount('');
    setError(null);
    onResetTransaction();
  };

  const needsApproval = (activeTab === 'supply' || activeTab === 'repay') &&
    approvalState !== 'approved';

  const isPending = actionTransaction.status === 'pending' ||
    actionTransaction.status === 'confirming';

  const tabs: { key: ActionType; label: string }[] = [
    { key: 'supply', label: 'Supply' },
    { key: 'withdraw', label: 'Withdraw' },
    { key: 'borrow', label: 'Borrow' },
    { key: 'repay', label: 'Repay' },
  ];

  const poolLiquidity = poolInfo ? poolInfo.totalSupply - poolInfo.totalBorrow : 0n;
  const isBorrowLimitedByPool =
    activeTab === 'borrow' &&
    !!position &&
    !!poolInfo &&
    position.maxBorrow > poolLiquidity &&
    poolLiquidity > 0n;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg shadow-black/50">
      <div className="flex border-b border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`flex-1 px-4 py-3 text-xs font-medium uppercase tracking-[0.18em] transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-indigo-400 bg-slate-900 text-indigo-200'
                : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-100'
            }`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Amount (USD8)
          </label>
          <div className="flex items-center gap-2 rounded-xl bg-slate-950/80 px-3 py-2 ring-1 ring-slate-800 focus-within:ring-2 focus-within:ring-indigo-400">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                const raw = e.target.value;
                const digitsAndDot = raw.replace(/[^0-9.]/g, '');
                const parts = digitsAndDot.split('.');
                const allowed = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : digitsAndDot;
                setAmount(allowed);
                setError(null);
              }}
              placeholder="0.0"
              disabled={isPending}
              className="h-10 flex-1 bg-transparent font-mono text-xl text-slate-50 outline-none placeholder:text-slate-600"
            />
            <button
              type="button"
              onClick={handleMaxClick}
              className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              MAX
            </button>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Max: {formatTokenAmount(getMaxAmount())} USD8
            {isBorrowLimitedByPool && ' (limited by pool cap)'}
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        {needsApproval && (
          <ApprovalButton
            approvalState={approvalState}
            transaction={approvalTransaction}
            onApprove={onApprove}
            tokenSymbol="USD8"
          />
        )}

        <button
          type="submit"
          disabled={isPending || (needsApproval && approvalState === 'not_approved')}
          className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {isPending ? 'Processing...' : tabs.find((t) => t.key === activeTab)?.label}
        </button>

        {/* <TransactionStatus
          transaction={actionTransaction}
          onDismiss={onResetTransaction}
        /> */}
      </form>
    </div>
  );
}
