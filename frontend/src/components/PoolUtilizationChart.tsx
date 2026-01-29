import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PoolInfo } from '../types';
import { formatTokenAmount, bigintToChartNumber } from '../utils/format';
import { TOOLTIP_STYLE } from './chartStyles';

interface PoolUtilizationChartProps {
  poolInfo: PoolInfo | null;
  isLoading: boolean;
}

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa'];

export function PoolUtilizationChart({ poolInfo, isLoading }: PoolUtilizationChartProps) {
  if (isLoading || !poolInfo) {
    return (
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Pool Utilization
        </h3>
        <div className="flex h-64 items-center justify-center text-slate-500">Loading...</div>
      </div>
    );
  }

  const totalSupply = poolInfo.totalSupply;
  const totalBorrow = poolInfo.totalBorrow;
  const available = totalSupply > totalBorrow ? totalSupply - totalBorrow : 0n;

  const borrowNum = bigintToChartNumber(totalBorrow);
  const availableNum = bigintToChartNumber(available);

  const data = [
    { name: 'Borrowed', value: borrowNum, raw: totalBorrow, fill: COLORS[0] },
    { name: 'Available', value: availableNum, raw: available, fill: COLORS[1] },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Pool Utilization
        </h3>
        <div className="flex h-64 items-center justify-center text-slate-500">No pool activity yet</div>
      </div>
    );
  }

  const utilizationPct = totalSupply > 0n
    ? Number((totalBorrow * 10000n) / totalSupply) / 100
    : 0;

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Pool Utilization
        </h3>
        <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-sm font-semibold text-indigo-300">
          {utilizationPct.toFixed(1)}% used
        </span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              stroke="rgba(15,23,42,0.8)"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE.contentStyle}
              labelStyle={TOOLTIP_STYLE.labelStyle}
              formatter={(_value: number | undefined, name: string | undefined, item: { payload?: { raw?: bigint }; raw?: bigint }) => {
                const raw = item?.payload?.raw ?? item?.raw ?? 0n;
                return [`${formatTokenAmount(raw)} USD8`, name];
              }}
            />
            <Legend
              formatter={(value: string) => (
                <span className="text-slate-300">
                  {value}: {formatTokenAmount(data.find((d) => d.name === value)?.raw ?? 0n)} USD8
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
