import { PoolInfo } from '../types';
import { formatTokenAmount, formatPercentage } from '../utils/format';
import { InfoTooltip } from './InfoTooltip';

interface PoolInfoSummaryProps {
  poolInfo: PoolInfo | null;
  isLoading: boolean;
}

export function PoolInfoSummary({ poolInfo, isLoading }: PoolInfoSummaryProps) {
  const availableLiquidity = poolInfo
    ? poolInfo.totalSupply - poolInfo.totalBorrow
    : 0n;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Pool Information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 animate-pulse"
            >
              <div className="mb-2 h-3 w-24 rounded bg-slate-700" />
              <div className="h-6 w-20 rounded bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        Pool Information
      </h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-5 shadow-xl backdrop-blur">
          <p className="mb-1 flex items-center text-xs font-medium uppercase tracking-wider text-slate-500">
            Total Supply
            <InfoTooltip content="Total USD8 deposited into the pool by all suppliers." label="Total Supply explanation" />
          </p>
          <p className="value-update font-mono text-xl font-bold text-white">
            {poolInfo ? formatTokenAmount(poolInfo.totalSupply) : '—'} USD8
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-5 shadow-xl backdrop-blur">
          <p className="mb-1 flex items-center text-xs font-medium uppercase tracking-wider text-slate-500">
            Available Liquidity
            <InfoTooltip content="USD8 available to borrow (total supply minus total borrowed)." label="Available Liquidity explanation" />
          </p>
          <p className="value-update font-mono text-xl font-bold text-emerald-400">
            {poolInfo ? formatTokenAmount(availableLiquidity) : '—'} USD8
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-5 shadow-xl backdrop-blur">
          <p className="mb-1 flex items-center text-xs font-medium uppercase tracking-wider text-slate-500">
            Total Borrowed
            <InfoTooltip content="Total USD8 currently borrowed from the pool." label="Total Borrowed explanation" />
          </p>
          <p className="value-update font-mono text-xl font-bold text-amber-400">
            {poolInfo ? formatTokenAmount(poolInfo.totalBorrow) : '—'} USD8
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-5 shadow-xl backdrop-blur">
          <p className="mb-1 flex items-center text-xs font-medium uppercase tracking-wider text-slate-500">
            Utilization Rate
            <InfoTooltip content="Share of supplied liquidity that is currently borrowed (total borrowed / total supply). Higher utilization typically means higher supply and borrow rates." label="Utilization Rate explanation" />
          </p>
          <p className="value-update font-mono text-xl font-bold text-sky-400">
            {poolInfo ? formatPercentage(poolInfo.utilizationRate) : '—'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-5 shadow-xl backdrop-blur">
          <p className="mb-1 flex items-center text-xs font-medium uppercase tracking-wider text-slate-500">
            Supply rate
            <InfoTooltip content="Supply rate" label="Supply rate" />
          </p>
          <p className="value-update font-mono text-xl font-bold text-emerald-400">
            {poolInfo ? formatPercentage(poolInfo.supplyRate) : '—'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-5 shadow-xl backdrop-blur">
          <p className="mb-1 flex items-center text-xs font-medium uppercase tracking-wider text-slate-500">
            Borrow rate
            <InfoTooltip content="Borrow rate" label="Borrow rate" />
          </p>
          <p className="value-update font-mono text-xl font-bold text-amber-400">
            {poolInfo ? formatPercentage(poolInfo.borrowRate) : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
