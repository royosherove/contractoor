import { HardhatRuntimeEnvironment } from "hardhat/types";

export interface DeployItem {
    contract: string;
    args?: any[]; // Optional constructor arguments
    initializeWith?: any[]; // Optional initialization arguments
    dependencies?: string[]; // Optional dependencies
}
export interface ConfigParams {
    contracts: DeployItem[]
}
export interface EngineParams {
    hre: HardhatRuntimeEnvironment
    rootDir: string;
    configFilePath: string;
}
