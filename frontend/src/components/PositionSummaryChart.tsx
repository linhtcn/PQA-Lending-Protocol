import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { UserPosition } from '../types';
import { formatTokenAmount, bigintToChartNumber } from '../utils/format';
import { TOOLTIP_STYLE } from './chartStyles';

interface PositionSummaryChartProps {
  position: UserPosition | null;
  isLoading: boolean;
}

export function PositionSummaryChart({ position, isLoading }: PositionSummaryChartProps) {
  if (isLoading || !position) {
    return (
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Your Position Summary
        </h3>
        <div className="flex h-56 items-center justify-center text-slate-500">Loading...</div>
      </div>
    );
  }

  const suppliedNum = bigintToChartNumber(position.supplied);
  const borrowedNum = bigintToChartNumber(position.borrowed);
  const maxWithdrawNum = bigintToChartNumber(position.maxWithdraw);
  const maxBorrowNum = bigintToChartNumber(position.maxBorrow);

  const data = [
    { label: 'Supplied', value: suppliedNum, raw: position.supplied, color: '#10b981' },
    { label: 'Borrowed', value: borrowedNum, raw: position.borrowed, color: '#f59e0b' },
    { label: 'Max Withdraw', value: maxWithdrawNum, raw: position.maxWithdraw, color: '#6366f1' },
    { label: 'Max Borrow', value: maxBorrowNum, raw: position.maxBorrow, color: '#8b5cf6' },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Your Position Summary
        </h3>
        <div className="flex h-56 items-center justify-center text-slate-500">No position yet</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        Your Position Summary
      </h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE.contentStyle}
              labelStyle={TOOLTIP_STYLE.labelStyle}
              formatter={(_value: number | undefined, name: string | undefined, item: { raw?: bigint; label?: string }) => [
                `${formatTokenAmount(item?.raw ?? 0n)} USD8`,
                item?.label ?? name,
              ]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} minPointSize={8}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
