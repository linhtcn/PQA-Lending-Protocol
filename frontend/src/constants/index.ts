// export const NETWORK_CONFIG = {
//   chainId: 11155111,
//   chainIdHex: '0xaa36a7', // Sepolia chainId in hex
//   name: 'Sepolia Testnet',
//   rpcUrl: 'https://rpc.sepolia.org', // public Sepolia RPC; MetaMask can also use its own
//   currency: {
//     name: 'Sepolia Ether',
//     symbol: 'ETH',
//     decimals: 18,
//   },
// } as const;

export const NETWORK_CONFIG = {
  chainId: 31337,
  chainIdHex: "0x7A69", // Hardhat chainId in hex
  name: "Hardhat Local",
  rpcUrl: "http://127.0.0.1:8545", // Hardhat RPC
  currency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  }
} as const;

export const HEALTH_FACTOR_THRESHOLDS = {
  DANGER: 100n,   // Below 100% - liquidation risk
  WARNING: 150n,  // 100-150% - caution
  SAFE: 200n,     // Above 150% - safe
} as const;

export const LTV_RATIO = 75n; // 75%

export const TOKEN_DECIMALS = 18;

export const MAX_UINT256 = 2n ** 256n - 1n;
