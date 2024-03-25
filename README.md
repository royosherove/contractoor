# Contractoor

This is still a work in progress and not recommended for production use. very early alpha.

## Description
Contractoor is a Smart Smart Contract Deployer designed to streamline the deployment of smart contracts. It simplifies the process of deploying contracts to the blockchain, managing dependencies, and ensuring that contracts are deployed efficiently and correctly.

### Example Configuration

# Getting Started

```bash
npm install contractoor
or
yarn add contractoor

npx contractoor init # generates contractoor.config.ts in root
```

## Place the following code in your hardhat.config.ts:

```typescript
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import {deplooy} from "contractoor"

const config: HardhatUserConfig = {
  solidity: "0.8.24",
};

task("deploy", "uses contractoor: Deploys smart contracts based on contractoor.config.ts", async (_, hre) => {
  await hre.run('compile'); // Ensure contracts are compiled before deployment
  const rootDir = "./contracts"; // Specify the root directory for your contracts
  const configFilePath = "./contractoor.config.ts"; // Specify the path to your configuration file
  await deplooy({ hre, rootDir, configFilePath });
})

export default config;

```

## Example contractoor.config.ts file

```typescript

import { ConfigParams } from "contractoor";


const config: ConfigParams = {
    contracts: [
        {
            contract: "MyParentContract" // <--matches contracts/**/MyParentContract.sol
        },
        {
            contract: "ChildContract",
            args: ["@MyParentContract"], //<- deployed first and replaced with address
        }
    ]
};
export default config;
```


# Features
- **Dependency Based Smart Contract Deployment**: Easily deploy your smart contracts in the correct order
- **Dependency Management**: Automatically handles the deployment of dependent contracts.
- **Address Resolution** : Use deployed addresses as args for dependent contracts : 
- **.ENV support**: TBD
- **.initialize() support**: TBD
- **function calling support**  : TBD

