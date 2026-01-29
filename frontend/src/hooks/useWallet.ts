import { useCallback } from 'react';
import { useConnection, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { WalletState } from '../types';
import { NETWORK_CONFIG } from '../constants';

export function useWallet() {
  const { address, chainId, status } = useConnection();
  const { connect: wagmiConnect, connectors, isPending: isConnecting, error: connectError } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { switchChainAsync, error: switchError } = useSwitchChain();

  const isConnected = status === 'connected' && !!address;
  const error =
    (connectError && typeof connectError === 'object' && 'message' in connectError
      ? (connectError as Error).message
      : connectError)
    ?? (switchError && typeof switchError === 'object' && 'message' in switchError
      ? (switchError as Error).message
      : switchError)
    ?? null;

  const switchToHardhat = useCallback(async () => {
    try {
      await switchChainAsync?.({ chainId: NETWORK_CONFIG.chainId });
      return true;
    } catch {
      return false;
    }
  }, [switchChainAsync]);

  const connect = useCallback(() => {
    const injectedConnector = connectors.find((c) => c.type === 'injected' || c.id === 'injected');
    if (!injectedConnector) return;
    wagmiConnect({ connector: injectedConnector });
  }, [connectors, wagmiConnect]);

  const disconnectWallet = useCallback(() => {
    wagmiDisconnect();
  }, [wagmiDisconnect]);

  const wallet: WalletState & {
    connect: () => void;
    disconnect: () => void;
    switchToHardhat: () => Promise<boolean>;
    isCorrectNetwork: boolean;
  } = {
    isConnected,
    address: address ?? null,
    chainId: chainId ?? null,
    isConnecting,
    error,
    connect,
    disconnect: disconnectWallet,
    switchToHardhat,
    isCorrectNetwork: chainId === NETWORK_CONFIG.chainId,
  };

  return wallet;
}
