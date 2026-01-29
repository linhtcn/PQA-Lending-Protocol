import { ExternalLink } from 'lucide-react';
import { TokenBalance } from '../types';
import { BLOCK_EXPLORER_ADDRESS_URL } from '../constants';

interface TokenBalancesProps {
  usd8Balance: TokenBalance | null;
  wethBalance: TokenBalance | null;
  usd8ContractAddress?: `0x${string}`;
  wethContractAddress?: `0x${string}`;
  isLoading: boolean;
}

export function TokenBalances({
  usd8Balance,
  wethBalance,
  usd8ContractAddress,
  wethContractAddress,
  isLoading,
}: TokenBalancesProps) {
  const linkToContract = (address: `0x${string}`) =>
    `${BLOCK_EXPLORER_ADDRESS_URL}/${address}`;
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow shadow-black/40">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Your Balances
        </h3>
        <div className="py-6 text-center text-sm text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow shadow-black/40">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        Your Balances
      </h3>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            USD8
            {usd8ContractAddress && (
              <a
                href={linkToContract(usd8ContractAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                title="View USD8 contract on block explorer"
                aria-label="View USD8 contract on block explorer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </span>
          <span className="value-update font-mono text-lg">
            {usd8Balance ? usd8Balance.formatted : '0'}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            WETH
            {wethContractAddress && (
              <a
                href={linkToContract(wethContractAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                title="View WETH contract on block explorer"
                aria-label="View WETH contract on block explorer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </span>
          <span className="value-update font-mono text-lg">
            {wethBalance ? wethBalance.formatted : '0'}
          </span>
        </div>
      </div>
    </div>
  );
}
