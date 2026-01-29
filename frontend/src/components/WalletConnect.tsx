import { formatAddress } from '../utils/format';

interface WalletConnectProps {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function WalletConnect({
  isConnected,
  address,
  isConnecting,
  // error,
  onConnect,
  onDisconnect,
}: WalletConnectProps) {
  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2">
        <span className="font-mono text-sm text-slate-100">
          {formatAddress(address)}
        </span>
        <button
          onClick={onDisconnect}
          className="inline-flex items-center rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-50 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onConnect}
        disabled={isConnecting}
        className="inline-flex items-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  );
}
