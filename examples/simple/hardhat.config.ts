import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import {deplooy} from "contractoor"

import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
     // for testnet
     'basesepolia': {
      url: 'https://sepolia.base.org',
      accounts: [process.env.WALLET_KEY as string],
      gasPrice: 1000000000,
    } 
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
      basesepolia: process.env.BASESCAN_API_KEY||"",
    },
    customChains: [
      {
        network: "basesepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org/"
        }
      }
    ]
  },
};

task("deploy", "Deploys contracts based on the configuration", async (_, hre) => {
  await hre.run('compile'); // Ensure contracts are compiled before deployment
  const rootDir = "./contracts"; // Specify the root directory for your contracts
  const configFilePath = "./contractoor.config.ts"; // Specify the path to your configuration file
  await deplooy({ hre, rootDir, configFilePath });
})
export default config;
