import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
dotenv.config();

type Network =
  | "bscMainnet"
  | "bscTestnet"
  | "maticMainnet"
  | "maticTestnet"
  | "ethMainnet"
  | "ethTestnet"
  | "avaxMainnet"
  | "avaxTestnet";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const networkConfig = (name: Network, privateKey: string | undefined) => {
  const url = {
    bscMainnet: "https://bsc-dataseed1.binance.org/",
    bscTestnet: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    maticMainnet: "https://polygon-rpc.com/",
    maticTestnet: "https://rpc-mumbai.matic.today",
    // we recommend to use Moralis to get a free node to deploy your contract
    // For ETH: https://docs.moralis.io/speedy-nodes/connecting-to-rpc-nodes/connect-to-eth-node
    ethMainnet: "",
    ethTestnet: "",
    // For Avalanche https://docs.moralis.io/speedy-nodes/connecting-to-rpc-nodes/connect-to-avalanche-node
    avaxMainnet: "",
    avaxTestnet: "",
  };

  const accounts = privateKey ? [privateKey] : [];

  return {
    url: url[name],
    accounts,
  };
};

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    bscMainnet: networkConfig(
      "bscMainnet",
      process.env.PRIVATE_KEY_BSC_MAINNET
    ),
    bscTestnet: networkConfig(
      "bscTestnet",
      process.env.PRIVATE_KEY_BSC_TESTNET
    ),
    maticMainnet: networkConfig(
      "maticMainnet",
      process.env.PRIVATE_KEY_MATIC_MAINNET
    ),
    maticTestnet: networkConfig(
      "maticTestnet",
      process.env.PRIVATE_KEY_MATIC_TESTNET
    ),
    ethMainnet: networkConfig(
      "ethMainnet",
      process.env.PRIVATE_KEY_ETH_MAINNET
    ),
    ethTestnet: networkConfig(
      "ethTestnet",
      process.env.PRIVATE_KEY_ETH_TESTNET
    ),
    avaxMainnet: networkConfig(
      "avaxMainnet",
      process.env.PRIVATE_KEY_AVAX_MAINNET
    ),
    avaxTestnet: networkConfig(
      "avaxTestnet",
      process.env.PRIVATE_KEY_AVAX_TESTNET
    ),
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
