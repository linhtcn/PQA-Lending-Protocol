import { useWallet } from '../hooks/useWallet';
import { useContractAddresses } from '../hooks/useContracts';
import { useTokenBalance } from '../hooks/useTokenBalance';
import { useUserPosition } from '../hooks/useUserPosition';
import { TokenBalances } from '../components/TokenBalances';
import { UserPositionCard } from '../components/UserPositionCard';

export function Position() {
  const wallet = useWallet();
  const addresses = useContractAddresses();
  const usd8Balance = useTokenBalance(
    addresses.USD8 as `0x${string}`,
    wallet.address,
    'USD8'
  );
  const wethBalance = useTokenBalance(
    addresses.WETH as `0x${string}`,
    wallet.address,
    'WETH'
  );
  const userPosition = useUserPosition(
    addresses.SimpleLending as `0x${string}`,
    wallet.address
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-white md:text-3xl">Your Position</h1>
        <p className="text-slate-400">Supplied, borrowed, and limits</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UserPositionCard
          position={userPosition.position}
          isLoading={userPosition.isLoading}
        />
        <TokenBalances
          usd8Balance={usd8Balance.balance}
          wethBalance={wethBalance.balance}
          usd8ContractAddress={addresses.USD8 as `0x${string}`}
          wethContractAddress={addresses.WETH as `0x${string}`}
          isLoading={usd8Balance.isLoading || wethBalance.isLoading}
        />
      </div>
    </div>
  );
}
