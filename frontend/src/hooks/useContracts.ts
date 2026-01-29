import { useMemo } from 'react';
import { DeploymentInfo } from '../types';
import deployments from '../contracts/deployments.json';

export function getContractAddresses(): DeploymentInfo['contracts'] {
  return (deployments as DeploymentInfo).contracts;
}

export function useContractAddresses(): DeploymentInfo['contracts'] {
  return useMemo(() => getContractAddresses(), []);
}
