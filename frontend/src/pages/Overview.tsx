import { useContractAddresses } from '../hooks/useContracts';
import { usePoolInfo } from '../hooks/usePoolInfo';
import { PoolUtilizationChart } from '../components/PoolUtilizationChart';
import { PoolBalanceLineChart } from '../components/PoolBalanceLineChart';
import { PoolInfoSummary } from '../components/PoolInfoSummary';

export function Overview() {
  const addresses = useContractAddresses();
  const poolInfo = usePoolInfo(addresses.SimpleLending as `0x${string}`);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-white md:text-3xl">Overview</h1>
        <p className="text-slate-400">Pool stats at a glance</p>
      </div>

      {/* Pool Information (single source at top) */}
      <PoolInfoSummary poolInfo={poolInfo.poolInfo} isLoading={poolInfo.isLoading} />

      {/* Pool balance line chart (full width) */}
      <PoolBalanceLineChart poolInfo={poolInfo.poolInfo} isLoading={poolInfo.isLoading} />

      {/* Pool utilization pie */}
      <PoolUtilizationChart poolInfo={poolInfo.poolInfo} isLoading={poolInfo.isLoading} />
    </div>
  );
}
