import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { PoolInfo } from '../types';
import { formatTokenAmount, bigintToChartNumber } from '../utils/format';
import { TOOLTIP_STYLE } from './chartStyles';

interface PoolBalanceLineChartProps {
  poolInfo: PoolInfo | null;
  isLoading: boolean;
}

const DECIMALS = 18;

const COLORS = {
  totalSupply: '#10b981',
  totalBorrow: '#f59e0b',
  available: '#6366f1',
};

export function PoolBalanceLineChart({ poolInfo, isLoading }: PoolBalanceLineChartProps) {
  if (isLoading || !poolInfo) {
    return (
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Pool Balance
        </h3>
        <div className="flex h-64 items-center justify-center text-slate-500">Loading...</div>
      </div>
    );
  }

  const totalSupply = poolInfo.totalSupply;
  const totalBorrow = poolInfo.totalBorrow;
  const available = totalSupply > totalBorrow ? totalSupply - totalBorrow : 0n;

  const data = [
    { label: 'Total Supply', value: bigintToChartNumber(totalSupply, DECIMALS), raw: totalSupply, fill: COLORS.totalSupply },
    { label: 'Total Borrowed', value: bigintToChartNumber(totalBorrow, DECIMALS), raw: totalBorrow, fill: COLORS.totalBorrow },
    { label: 'Available Liquidity', value: bigintToChartNumber(available, DECIMALS), raw: available, fill: COLORS.available },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Pool Balance (USD8)
        </h3>
        <div className="flex h-64 items-center justify-center text-slate-500">No pool activity yet</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        Pool Balance (USD8)
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE.contentStyle as React.CSSProperties}
              labelStyle={TOOLTIP_STYLE.labelStyle as React.CSSProperties}
              formatter={(_value: number | undefined, _name: string | undefined, item: { payload?: { label?: string; raw?: bigint } }) => [
                `${formatTokenAmount(item?.payload?.raw ?? 0n)} USD8`,
                item?.payload?.label ?? '',
              ]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} minPointSize={12}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
