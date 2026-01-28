import { useMemo } from 'react';
import { Contract, BrowserProvider } from 'ethers';
import { Contracts, DeploymentInfo } from '../types';

import TestTokenABI from '../abis/TestToken.json';
import SimpleLendingABI from '../abis/SimpleLending.json';
import deployments from '../contracts/deployments.json';

export function useContracts(provider: BrowserProvider | null): Contracts {
  return useMemo(() => {
    if (!provider) {
      return {
        usd8: null,
        weth: null,
        simpleLending: null,
      };
    }

    const deployment = deployments as DeploymentInfo;

    const usd8 = new Contract(
      deployment.contracts.USD8,
      TestTokenABI,
      provider
    );

    const weth = new Contract(
      deployment.contracts.WETH,
      TestTokenABI,
      provider
    );

    const simpleLending = new Contract(
      deployment.contracts.SimpleLending,
      SimpleLendingABI,
      provider
    );

    return {
      usd8,
      weth,
      simpleLending,
    };
  }, [provider]);
}

export function getContractAddresses(): DeploymentInfo['contracts'] {
  return (deployments as DeploymentInfo).contracts;
}
