import { formatUnits } from 'viem';
import { TOKEN_DECIMALS } from '../constants';

/** Convert bigint to number for chart Y-axis (human scale, preserves proportions). */
export function bigintToChartNumber(amount: bigint, decimals: number = TOKEN_DECIMALS): number {
  const s = formatUnits(amount, decimals);
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

export function formatTokenAmount(
  amount: bigint,
  decimals: number = TOKEN_DECIMALS,
  displayDecimals: number = 4
): string {
  const formatted = formatUnits(amount, decimals);
  const num = parseFloat(formatted);

  if (num === 0) return '0';
  if (num < 0.0001) return '< 0.0001';

  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  });
}

/** Format a rate (0–100 scale) with up to 2 decimal places, e.g. supply/borrow/utilization. */
export function formatPercentage(rate: bigint): string {
  return `${rate.toString()}%`;
}

export function formatHealthFactor(healthFactor: bigint, isInfinite: boolean ): string {
  if (isInfinite) {
    return '\u221E'; // Infinity symbol
  }

  return `${healthFactor.toString()}%`;
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTxHash(hash: string): string {
  if (!hash || hash.length < 10) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}
