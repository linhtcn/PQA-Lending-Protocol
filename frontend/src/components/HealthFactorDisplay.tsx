import { formatHealthFactor } from '../utils/format';
import { HEALTH_FACTOR_THRESHOLDS } from '../constants';

interface HealthFactorDisplayProps {
  healthFactor: bigint;
  borrowed: bigint;
}

export function HealthFactorDisplay({ healthFactor, borrowed }: HealthFactorDisplayProps) {
  const MAX_UINT256 = 2n ** 256n - 1n;
  const isInfinite = healthFactor === MAX_UINT256;
  const hasBorrowed = borrowed > 0n;

  let colorClass =
    'bg-linear-to-br from-emerald-500/60 via-emerald-500/30 to-emerald-300/40 text-emerald-50';
  let statusText = 'Safe';

  if (!isInfinite && hasBorrowed) {
    if (healthFactor < HEALTH_FACTOR_THRESHOLDS.DANGER) {
      colorClass =
        'bg-linear-to-br from-red-500/70 via-red-500/40 to-rose-500/40 text-red-100';
      statusText = 'Liquidation Risk';
    } else if (healthFactor < HEALTH_FACTOR_THRESHOLDS.WARNING) {
      colorClass =
        'bg-linear-to-br from-rose-500/70 via-red-500/40 to-amber-400/40 text-amber-100';
      statusText = 'Caution';
    } else if (healthFactor < HEALTH_FACTOR_THRESHOLDS.SAFE) {
      colorClass =
        'bg-linear-to-br from-amber-400/70 via-amber-400/40 to-emerald-400/40 text-amber-50';
      statusText = 'Moderate';
    }
  } else {
    colorClass =
      'bg-linear-to-br from-slate-500/60 via-slate-500/30 to-slate-300/40 text-slate-50';
  }

  return (
    <div
      className={`flex flex-col items-center rounded-xl px-6 py-5 text-center shadow-inner shadow-black/40 ${colorClass}`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-80">
        Health Factor
      </span>
      <span className="mt-1 font-mono text-3xl font-bold">
        {formatHealthFactor(healthFactor)}
      </span>
      <span className="mt-1 text-xs opacity-90">
        {isInfinite ? 'No Borrows' : statusText}
      </span>
    </div>
  );
}
