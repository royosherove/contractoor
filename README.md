# Contractoor

## Description
Contractoor is a Smart Smart Contract Deployer designed to streamline the deployment of smart contracts. It simplifies the process of deploying contracts to the blockchain, managing dependencies, and ensuring that contracts are deployed efficiently and correctly.

### Example Configuration

Below is an example of how to configure Contractoor for deploying smart contracts:
```typescript
import { ConfigParams } from "./src/engine";


const config: ConfigParams = {
    contracts: [
        {
            contract: "MyParentContract"
        },
        {
            contract: "ChildContract",
            args: ["@MyParentContract"], //<--replaced with MyParentContract address
            dependencies:["MyParentContract"]  
        }
    ]
};
export default config;
```


## Features
- **Smart Contract Deployment**: Easily deploy your smart contracts to the blockchain.
- **Dependency Management**: Automatically handles the deployment of dependent contracts.
- **Configuration Based Deployment**: Deploy contracts based on a predefined configuration file.
- **Logging and Error Handling**: Provides detailed logs for deployments and gracefully handles errors.

