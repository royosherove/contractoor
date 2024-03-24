import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import {deplooy} from "contractoor"

const config: HardhatUserConfig = {
  solidity: "0.8.24",
};

task("deploy", "Deploys contracts based on the configuration", async (_, hre) => {
  await hre.run('compile'); // Ensure contracts are compiled before deployment
  const rootDir = "./contracts"; // Specify the root directory for your contracts
  const configFilePath = "./contractoor.config.ts"; // Specify the path to your configuration file
  await deplooy({ hre, rootDir, configFilePath });
})
export default config;
