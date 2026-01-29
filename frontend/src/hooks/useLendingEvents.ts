import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import SimpleLendingABI from '../abis/SimpleLending.json';

export type LendingEventType = 'Supplied' | 'Withdrawn' | 'Borrowed' | 'Repaid';

export interface LendingEventRow {
  no: number;
  type: LendingEventType;
  date: Date;
  txHash: `0x${string}`;
  blockNumber: bigint;
}

const LENDING_EVENT_NAMES: LendingEventType[] = ['Supplied', 'Withdrawn', 'Borrowed', 'Repaid'];

/** RPC limit for eth_getLogs is often ~2000 blocks; use a safe range. */
const BLOCK_RANGE = 2_000n;

export function useLendingEvents(lendingAddress: `0x${string}` | null) {
  const publicClient = usePublicClient();

  const query = useQuery({
    queryKey: ['lending-events', lendingAddress ?? '', publicClient?.chain?.id],
    queryFn: async (): Promise<LendingEventRow[]> => {
      if (!publicClient || !lendingAddress) return [];

      const blockNumber = await publicClient.getBlockNumber();
      const fromBlock = blockNumber > BLOCK_RANGE ? blockNumber - BLOCK_RANGE : 0n;

      const events = await publicClient.getContractEvents({
        address: lendingAddress,
        abi: SimpleLendingABI as readonly unknown[],
        fromBlock,
        toBlock: 'latest',
      });

      const rows: LendingEventRow[] = [];
      let no = 0;
      for (const log of events) {
        const eventName = log.eventName as string;
        if (!LENDING_EVENT_NAMES.includes(eventName as LendingEventType)) continue;

        const args = log.args as { user?: string; amount?: bigint; timestamp?: bigint };
        const timestamp = args?.timestamp != null ? Number(args.timestamp) * 1000 : Date.now();

        rows.push({
          no: ++no,
          type: eventName as LendingEventType,
          date: new Date(timestamp),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber ?? 0n,
        });
      }

      rows.sort((a, b) => Number(b.blockNumber - a.blockNumber));
      rows.forEach((row, i) => {
        row.no = i + 1;
      });

      return rows;
    },
    enabled: !!publicClient && !!lendingAddress,
  });

  return {
    events: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? String(query.error) : null,
    refetch: query.refetch,
  };
}
