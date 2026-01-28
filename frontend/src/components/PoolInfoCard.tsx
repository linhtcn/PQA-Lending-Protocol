import { PoolInfo } from '../types';
import { formatTokenAmount, formatPercentage } from '../utils/format';

interface PoolInfoCardProps {
  poolInfo: PoolInfo | null;
  isLoading: boolean;
}

export function PoolInfoCard({ poolInfo, isLoading }: PoolInfoCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow shadow-black/40">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Pool Information
        </h3>
        <div className="py-6 text-center text-sm text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!poolInfo) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow shadow-black/40">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Pool Information
        </h3>
        <p className="text-sm text-slate-400">Connect wallet to view pool info</p>
      </div>
    );
  }

  const availableLiquidity = poolInfo.totalSupply - poolInfo.totalBorrow;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow shadow-black/40">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        Pool Information
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1 rounded-xl bg-slate-900 px-4 py-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Total Supply
          </span>
          <span className="value-update font-mono text-lg font-semibold">
            {formatTokenAmount(poolInfo.totalSupply)} USD8
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-slate-900 px-4 py-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Total Borrowed
          </span>
          <span className="value-update font-mono text-lg font-semibold">
            {formatTokenAmount(poolInfo.totalBorrow)} USD8
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-slate-900 px-4 py-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Available Liquidity
          </span>
          <span className="value-update font-mono text-lg font-semibold">
            {formatTokenAmount(availableLiquidity)} USD8
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-slate-900 px-4 py-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Max Borrow (Pool Cap)
          </span>
          <span className="value-update font-mono text-lg font-semibold">
            {formatTokenAmount(availableLiquidity)} USD8
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-slate-900 px-4 py-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Utilization Rate
          </span>
          <span className="value-update font-mono text-lg font-semibold">
            {formatPercentage(poolInfo.utilizationRate)}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-slate-900 px-4 py-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Supply APY
          </span>
          <span className="font-mono text-lg font-semibold text-emerald-400">
            {formatPercentage(poolInfo.supplyRate)}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-slate-900 px-4 py-3 sm:col-span-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Borrow APR
          </span>
          <span className="font-mono text-lg font-semibold text-amber-300">
            {formatPercentage(poolInfo.borrowRate)}
          </span>
        </div>
      </div>
    </div>
  );
}
