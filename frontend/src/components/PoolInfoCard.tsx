import { PoolInfo } from '../types';
import { formatTokenAmount, formatPercentage } from '../utils/format';
import { InfoTooltip } from './InfoTooltip';

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
          <span className="flex items-center text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Total Supply
            <InfoTooltip content="Total USD8 deposited into the pool by all suppliers." label="Total Supply explanation" />
          </span>
          <span className="value-update font-mono text-lg font-semibold">
            {formatTokenAmount(poolInfo.totalSupply)} USD8
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-slate-900 px-4 py-3">
          <span className="flex items-center text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Total Borrowed
            <InfoTooltip content="Total USD8 currently borrowed from the pool." label="Total Borrowed explanation" />
          </span>
          <span className="value-update font-mono text-lg font-semibold">
            {formatTokenAmount(poolInfo.totalBorrow)} USD8
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-slate-900 px-4 py-3">
          <span className="flex items-center text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Available Liquidity
            <InfoTooltip content="USD8 available to borrow (total supply minus total borrowed)." label="Available Liquidity explanation" />
          </span>
          <span className="value-update font-mono text-lg font-semibold">
            {formatTokenAmount(availableLiquidity)} USD8
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-slate-900 px-4 py-3">
          <span className="flex items-center text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Max Borrow (Pool Cap)
            <InfoTooltip content="Maximum USD8 that can be borrowed from the pool (same as available liquidity)." label="Max Borrow explanation" />
          </span>
          <span className="value-update font-mono text-lg font-semibold">
            {formatTokenAmount(availableLiquidity)} USD8
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-slate-900 px-4 py-3">
          <span className="flex items-center text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Utilization Rate
            <InfoTooltip content="Share of supplied USD8 that is currently borrowed (total borrowed ÷ total supply)." label="Utilization Rate explanation" />
          </span>
          <span className="value-update font-mono text-lg font-semibold">
            {formatPercentage(poolInfo.utilizationRate)}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-slate-900 px-4 py-3">
          <span className="flex items-center text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Supply APY
            <InfoTooltip content="Annual percentage yield earned by suppliers on their deposited USD8." label="Supply APY explanation" />
          </span>
          <span className="font-mono text-lg font-semibold text-emerald-400">
            {formatPercentage(poolInfo.supplyRate)}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-slate-900 px-4 py-3 sm:col-span-2">
          <span className="flex items-center text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Borrow APR
            <InfoTooltip content="Annual percentage rate paid by borrowers on their borrowed USD8." label="Borrow APR explanation" />
          </span>
          <span className="font-mono text-lg font-semibold text-amber-300">
            {formatPercentage(poolInfo.borrowRate)}
          </span>
        </div>
      </div>
    </div>
  );
}
