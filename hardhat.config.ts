import * as dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';
import "@nomiclabs/hardhat-ethers";
dotenv.config();

// Helper function to format private key
const getPrivateKey = (): string[] => {
  if (!process.env.DEPLOYER_PK) return [];
  const pk = process.env.DEPLOYER_PK.trim();
  const formattedPk = pk.startsWith('0x') ? pk : `0x${pk}`;
  return [formattedPk];
};

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    // Mainnet Networks
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      accounts: getPrivateKey(),
      gasPrice: 20000000000, // 20 gwei
    },
    polygon: {
      url: `https://polygon-rpc.com/`,
      accounts: getPrivateKey(),
    },
    bsc: {
      url: `https://bsc-dataseed.binance.org/`,
      accounts: getPrivateKey(),
    },
    avalanche: {
      url: `https://api.avax.network/ext/bc/C/rpc`,
      accounts: getPrivateKey(),
    },
    // Testnet Networks
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      accounts: getPrivateKey(),
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      accounts: getPrivateKey(),
    },
    bsctest: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
      accounts: getPrivateKey(),
    },
    fuji: {
      url: `https://api.avax-test.network/ext/bc/C/rpc`,
      accounts: getPrivateKey(),
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
