import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { PoolInfo } from '../types';
import { formatPercentage } from '../utils/format';
import { TOOLTIP_STYLE } from './chartStyles';

interface PoolRatesChartProps {
  poolInfo: PoolInfo | null;
  isLoading: boolean;
}

export function PoolRatesChart({ poolInfo, isLoading }: PoolRatesChartProps) {
  if (isLoading || !poolInfo) {
    return (
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Supply & Borrow Rates
        </h3>
        <div className="flex h-64 items-center justify-center text-slate-500">Loading...</div>
      </div>
    );
  }

  const supplyRateNum = Number(poolInfo.supplyRate.toString());
  const borrowRateNum = Number(poolInfo.borrowRate.toString());
  const utilizationNum = Number(poolInfo.utilizationRate.toString());

  const data = [
    { label: 'Supply rate', value: supplyRateNum, color: '#10b981' },
    { label: 'Borrow rate', value: borrowRateNum, color: '#f59e0b' },
    { label: 'Utilization', value: utilizationNum, color: '#6366f1' },
  ];

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        Supply & Borrow Rates
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE.contentStyle}
              labelStyle={TOOLTIP_STYLE.labelStyle}
              formatter={(value: number | undefined) => [`${value ?? 0}%`, 'Rate']}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <span className="text-emerald-400">Supply rate: {formatPercentage(poolInfo.supplyRate)}</span>
        <span className="text-amber-400">Borrow rate: {formatPercentage(poolInfo.borrowRate)}</span>
      </div>
    </div>
  );
}
