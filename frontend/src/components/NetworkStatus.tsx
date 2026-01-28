import { NETWORK_CONFIG } from '../constants';

interface NetworkStatusProps {
  chainId: number | null;
  isCorrectNetwork: boolean;
  onSwitchNetwork: () => void;
}

export function NetworkStatus({
  chainId,
  isCorrectNetwork,
  onSwitchNetwork,
}: NetworkStatusProps) {
  if (!chainId) {
    return null;
  }

  const networkName = isCorrectNetwork
    ? NETWORK_CONFIG.name
    : `Unknown (${chainId})`;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
        isCorrectNetwork
          ? 'border-emerald-500/50 bg-emerald-900/40 text-emerald-100'
          : 'border-red-500/50 bg-red-900/40 text-red-100'
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isCorrectNetwork ? 'bg-emerald-400' : 'bg-red-400'
        }`}
      />
      <span>{networkName}</span>
      {!isCorrectNetwork && (
        <button
          onClick={onSwitchNetwork}
          className="ml-2 inline-flex items-center rounded-lg bg-amber-500 px-2 py-1 text-[10px] font-semibold text-slate-900 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
        >
          Switch to {NETWORK_CONFIG.name}
        </button>
      )}
    </div>
  );
}
