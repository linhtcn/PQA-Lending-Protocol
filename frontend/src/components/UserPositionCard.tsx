import { UserPosition } from '../types';
import { formatTokenAmount } from '../utils/format';
import { HealthFactorDisplay } from './HealthFactorDisplay';

interface UserPositionCardProps {
  position: UserPosition | null;
  isLoading: boolean;
}

export function UserPositionCard({ position, isLoading }: UserPositionCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow shadow-black/40">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Your Position
        </h3>
        <div className="py-6 text-center text-sm text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow shadow-black/40">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Your Position
        </h3>
        <p className="text-sm text-slate-400">Connect wallet to view your position</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow shadow-black/40">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        Your Position
      </h3>

      <HealthFactorDisplay healthFactor={position.healthFactor} borrowed={position.borrowed} />

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1 rounded-xl bg-slate-900 px-4 py-3">
          <span className="text-xs font-medium text-slate-400">Supplied</span>
          <span className="value-update font-mono text-base font-semibold">
            {formatTokenAmount(position.supplied)} USD8
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-slate-900 px-4 py-3">
          <span className="text-xs font-medium text-slate-400">Borrowed</span>
          <span className="value-update font-mono text-base font-semibold">
            {formatTokenAmount(position.borrowed)} USD8
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-slate-900 px-4 py-3">
          <span className="text-xs font-medium text-slate-400">Max Withdrawable</span>
          <span className="value-update font-mono text-base font-semibold">
            {formatTokenAmount(position.maxWithdraw)} USD8
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl bg-slate-900 px-4 py-3">
          <span className="text-xs font-medium text-slate-400">Max Borrowable</span>
          <span className="value-update font-mono text-base font-semibold">
            {formatTokenAmount(position.maxBorrow)} USD8
          </span>
        </div>
      </div>
    </div>
  );
}
