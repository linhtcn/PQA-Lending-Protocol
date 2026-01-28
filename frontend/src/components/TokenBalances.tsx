import { TokenBalance } from '../types';

interface TokenBalancesProps {
  usd8Balance: TokenBalance | null;
  wethBalance: TokenBalance | null;
  isLoading: boolean;
}

export function TokenBalances({
  usd8Balance,
  wethBalance,
  isLoading,
}: TokenBalancesProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow shadow-black/40">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Your Balances
        </h3>
        <div className="py-6 text-center text-sm text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow shadow-black/40">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        Your Balances
      </h3>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3">
          <span className="text-sm font-semibold text-slate-200">USD8</span>
          <span className="value-update font-mono text-lg">
            {usd8Balance ? usd8Balance.formatted : '0'}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3">
          <span className="text-sm font-semibold text-slate-200">WETH</span>
          <span className="value-update font-mono text-lg">
            {wethBalance ? wethBalance.formatted : '0'}
          </span>
        </div>
      </div>
    </div>
  );
}
