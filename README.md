# Contractoor

This is still a work in progress and not recommended for production use. very early alpha.
![image](https://github.com/royosherove/contractoor/assets/575051/aa620855-042d-4a30-8bc5-a5ad9e67f504)


## Description
Contractoor is a Smart Smart Contract Deployer designed to streamline the deployment of smart contracts using hardhat.
Say you have smart contracts that reply on other smart contracts's addresses, and deployment order matters.

Contractoor simplifies the process of deploying contracts to the blockchain, managing dependencies, and ensuring that contracts are deployed efficiently and correctly.

### Example Configuration

# Getting Started

```bash
npm install contractoor
or
yarn add contractoor
```

## Place the following code in your hardhat.config.ts:

```typescript
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import {deplooy} from "contractoor"

const config: HardhatUserConfig = {
  solidity: "0.8.24",
};

// important part:
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
            contract: "CounterManager",
            args: [env.OWNER_ADDRESS], //env variable using dotenv
        },
        {
            contract: "Counter",
            // will deploy CounterManager first and pass its address as an argument to Counter's constructor
            args: ["@CounterManager"], // constructor arguments
        },
        {
            contract: "ShouldBeInitialized",
            // after deployment, will call the initialize() function of the contract with the given arguments
            initializeWith: ["@CounterManager"],
        }

    ]
};
export default config;
```

# Examples
See [Examples Folder](https://github.com/royosherove/contractoor/tree/main/Examples)


# Features
- **Dependency Based Smart Contract Deployment**: Easily deploy your smart contracts in the correct order
- **Dependency Management**: Automatically handles the deployment of dependent contracts.
- **Address Resolution** : Use deployed addresses as args for dependent contracts : 
- **.ENV support**: TBD
- **.initialize() support**: TBD
- **function calling support**  : TBD

