import { useState, useCallback, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { WalletState } from '../types';
import { NETWORK_CONFIG } from '../constants';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

const initialState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  provider: null,
  isConnecting: false,
  error: null,
};

export function useWallet() {
  const [state, setState] = useState<WalletState>(initialState);

  const switchToHardhat = useCallback(async () => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG.chainIdHex }],
      });
      return true;
    } catch (switchError: unknown) {
      // Chain not added, try to add it
      if (switchError && typeof switchError === 'object' && 'code' in switchError && switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: NETWORK_CONFIG.chainIdHex,
                chainName: NETWORK_CONFIG.name,
                rpcUrls: [NETWORK_CONFIG.rpcUrl],
                nativeCurrency: NETWORK_CONFIG.currency,
              },
            ],
          });
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setState((prev) => ({
        ...prev,
        error: 'MetaMask not detected. Please install MetaMask.',
      }));
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Clear the manual disconnect flag
      sessionStorage.removeItem('wallet_manually_disconnected');
      
      // Request permissions first to ensure account selection dialog appears
      // This will show the account picker even if permissions were previously granted
      try {
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch (error) {
        // Some wallets don't support wallet_requestPermissions, fall back to eth_requestAccounts
        console.debug('wallet_requestPermissions not supported, using eth_requestAccounts:', error);
      }
      
      // Request accounts - this will show account selection if permissions were revoked
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned');
      }

      // Create provider
      const provider = new BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // Switch to Hardhat if not on it
      if (chainId !== NETWORK_CONFIG.chainId) {
        const switched = await switchToHardhat();
        if (!switched) {
          setState((prev) => ({
            ...prev,
            isConnecting: false,
            error: `Please switch to ${NETWORK_CONFIG.name} network`,
          }));
          return;
        }
        // Re-create provider after switch
        const newProvider = new BrowserProvider(window.ethereum);
        setState({
          isConnected: true,
          address: accounts[0],
          chainId: NETWORK_CONFIG.chainId,
          provider: newProvider,
          isConnecting: false,
          error: null,
        });
        return;
      }

      setState({
        isConnected: true,
        address: accounts[0],
        chainId,
        provider,
        isConnecting: false,
        error: null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to connect wallet';
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: message,
      }));
    }
  }, [switchToHardhat]);

  const disconnect = useCallback(async () => {
    // Mark as manually disconnected to prevent auto-reconnect
    sessionStorage.setItem('wallet_manually_disconnected', 'true');
    
    // Try to revoke permissions (EIP-2255) to ensure account selection on next connect
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch (error) {
        // Some wallets don't support wallet_revokePermissions, that's okay
        // We'll still reset state and rely on the manual disconnect flag
        console.debug('wallet_revokePermissions not supported or failed:', error);
      }
    }
    
    // Reset state
    setState(initialState);
  }, []);

  // Handle account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accountList = accounts as string[];
      if (accountList.length === 0) {
        setState(initialState);
      } else if (state.isConnected) {
        setState((prev) => ({
          ...prev,
          address: accountList[0],
        }));
      }
    };

    const handleChainChanged = async (chainId: unknown) => {
      const newChainId = parseInt(chainId as string, 16);
      if (newChainId !== NETWORK_CONFIG.chainId) {
        setState((prev) => ({
          ...prev,
          chainId: newChainId,
          error: `Please switch to ${NETWORK_CONFIG.name} network`,
        }));
      } else if (window.ethereum && state.isConnected) {
        const provider = new BrowserProvider(window.ethereum);
        setState((prev) => ({
          ...prev,
          chainId: newChainId,
          provider,
          error: null,
        }));
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [state.isConnected]);

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return;

      // Don't auto-connect if user manually disconnected
      const manuallyDisconnected = sessionStorage.getItem('wallet_manually_disconnected') === 'true';
      if (manuallyDisconnected) {
        return;
      }

      try {
        const accounts = (await window.ethereum.request({
          method: 'eth_accounts',
        })) as string[];

        if (accounts && accounts.length > 0) {
          const provider = new BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();
          const chainId = Number(network.chainId);

          setState({
            isConnected: true,
            address: accounts[0],
            chainId,
            provider,
            isConnecting: false,
            error: chainId !== NETWORK_CONFIG.chainId
              ? `Please switch to ${NETWORK_CONFIG.name} network`
              : null,
          });
        }
      } catch {
        // Silent fail on initial check
      }
    };

    checkConnection();
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    switchToHardhat,
    isCorrectNetwork: state.chainId === NETWORK_CONFIG.chainId,
  };
}
