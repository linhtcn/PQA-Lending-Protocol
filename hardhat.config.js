require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { ETHERSCAN_API_KEY, BSC_TESTNET_PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: BSC_TESTNET_PRIVATE_KEY ? [BSC_TESTNET_PRIVATE_KEY] : [],
      chainId: 97,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};
