import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
// import { task } from "hardhat/config";
import { start } from "./src/engine"; // Adjust the path as necessary

const config: HardhatUserConfig = {
  solidity: "0.8.24",
};

// Define a new task called "deploy-contracts"
task("deploy", "Deploys contracts based on the configuration", async (_, hre) => {
  await hre.run('compile'); // Ensure contracts are compiled before deployment
  const rootDir = "./contracts"; // Specify the root directory for your contracts
  const configFilePath = "./contractor.config.ts"; // Specify the path to your configuration file
  await start({hre, rootDir, configFilePath });
}).addOptionalParam("rootDir", "The root directory for contracts")
  .addOptionalParam("configFilePath", "The configuration file path");
export default config;
