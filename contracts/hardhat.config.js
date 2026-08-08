require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

const { ARBITRUM_SEPOLIA_RPC_URL, ETHERSCAN_API_KEY, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    arbitrumSepolia: {
      url: ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
      chainId: 421614,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
    customChains: [
      {
        network: 'arbitrumSepolia',
        chainId: 421614,
        urls: {
          apiURL: 'https://api.etherscan.io/v2/api',
          browserURL: 'https://sepolia.arbiscan.io',
        },
      },
    ],
  },
};