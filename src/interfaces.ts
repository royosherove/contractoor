import { HardhatRuntimeEnvironment } from "hardhat/types";

export interface ItemAction {
    target: string;
    command: string;
    args: any[];
}
export interface DeployItem {
    contract: string;
    args?: any[]; // Optional constructor arguments
    initializeWith?: any[]; // Optional initialization arguments
    dependencies?: string[]; // Optional dependencies
    actions?: ItemAction[]; // Optional actions to be performed after deployment
    verify?: boolean; // Optional flag to verify the contract
}
export interface ConfigParams {
    contracts: DeployItem[]
}
export interface EngineParams {
    hre: HardhatRuntimeEnvironment
    rootDir: string;
    configFilePath: string;
}
