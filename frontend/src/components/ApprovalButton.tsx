import { ApprovalState, TransactionState } from '../types';

interface ApprovalButtonProps {
  approvalState: ApprovalState;
  transaction: TransactionState;
  onApprove: () => void;
  tokenSymbol: string;
}

export function ApprovalButton({
  approvalState,
  transaction,
  onApprove,
  tokenSymbol,
}: ApprovalButtonProps) {
  const isApproving = approvalState === 'approving';
  const isApproved = approvalState === 'approved';
  const isPending = transaction.status === 'pending' || transaction.status === 'confirming';

  if (isApproved) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
        <span className="text-base font-semibold">&#10003;</span>
        <span className="font-medium">{tokenSymbol} Approved</span>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <button
        onClick={onApprove}
        disabled={isApproving || isPending}
        className="inline-flex w-full items-center justify-center rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-50 shadow hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-400"
      >
        {isApproving || isPending
          ? `Approving ${tokenSymbol}...`
          : `Approve ${tokenSymbol}`}
      </button>
    </div>
  );
}
