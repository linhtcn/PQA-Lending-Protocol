import { TransactionState } from '../types';
import { formatTxHash } from '../utils/format';

interface TransactionStatusProps {
  transaction: TransactionState;
  onDismiss?: () => void;
}

export function TransactionStatus({ transaction, onDismiss }: TransactionStatusProps) {
  if (transaction.status === 'idle') {
    return null;
  }

  const statusConfig = {
    pending: {
      icon: '...',
      text: 'Waiting for confirmation...',
      className:
        'bg-indigo-500/10 text-indigo-200 border border-indigo-500/40',
    },
    confirming: {
      icon: '...',
      text: 'Transaction confirming...',
      className:
        'bg-indigo-500/10 text-indigo-200 border border-indigo-500/40',
    },
    confirmed: {
      icon: '\u2713',
      text: 'Transaction confirmed!',
      className:
        'bg-emerald-500/10 text-emerald-200 border border-emerald-500/40',
    },
    failed: {
      icon: '\u2717',
      text: 'Transaction failed',
      className: 'bg-red-500/10 text-red-200 border border-red-500/40',
    },
  } as const;

  const config = statusConfig[transaction.status];

  return (
    <div
      className={`mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm shadow ${config.className}`}
    >
      <span className="text-base font-semibold">{config.icon}</span>
      <div className="flex flex-1 flex-col gap-1">
        <span className="font-medium">{config.text}</span>
        {transaction.hash && (
          <span className="font-mono text-[11px] opacity-80">
            {formatTxHash(transaction.hash)}
          </span>
        )}
      </div>
      {(transaction.status === 'confirmed' || transaction.status === 'failed') &&
        onDismiss && (
          <button
            onClick={onDismiss}
            className="text-lg text-slate-300 hover:text-white focus:outline-none"
          >
            &times;
          </button>
        )}
    </div>
  );
}
