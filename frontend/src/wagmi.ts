import { createConfig, http, injected } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';

export const wagmiConfig = createConfig({
  chains: [bscTestnet],
  connectors: [injected()],
  transports: {
    [bscTestnet.id]: http(),
  },
});
