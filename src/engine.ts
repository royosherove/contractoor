import fs from 'fs';
import path from 'path';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { startLogo, logInfo, logSuccess, logError } from './loggingUtil';

export interface DeployItem {
    contract: string;
    args?: any[]; // Optional constructor arguments
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

// Hashtable to keep track of deployed contracts' addresses
const _DEPLOYED: Record<string, string> = {};
const _DEPLOYING: string[] = [];

// Helper functions for logging with color

export async function start(params: EngineParams) {
    startLogo();
    logInfo(`Starting deployment from root directory: ${params.rootDir}`);
    try {
        await loadConfigAndDeploy(params.configFilePath, params.rootDir, params.hre);
        logSuccess('Deployment completed successfully.');
    } catch (error) {
        logError(`Deployment failed: ${error}`);
    }
}

async function loadConfigAndDeploy(configFilePath: string, rootDir: string, hre: HardhatRuntimeEnvironment) {
    try {
        // load from .ts file:
        // resolve the path to the configuration file
        const fullPath = path.resolve(configFilePath);
        const config: ConfigParams = require(fullPath).default;
        const contractItems = config.contracts;
        // log all contracts to be deployed
        contractItems.forEach((item) => {
            logInfo(`>>  Candidate contract: ${item.contract}`);
        });
        await searchAndDeployContracts(rootDir, contractItems, hre);
    } catch (error) {
        logError(`Error loading configuration: ${error}`);
        throw error;
    }
}

async function searchAndDeployContracts(rootDir: string, items: DeployItem[], hre: HardhatRuntimeEnvironment) {
    const files = fs.readdirSync(rootDir);
    const contractNames = items.map((item) => item.contract);

    for (const file of files) {
        const filePath = path.join(rootDir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            await searchAndDeployContracts(filePath, items, hre);
        } else if (stat.isFile() && contractNames.includes(path.basename(file, path.extname(file)))) {
            try {
                const contractName = path.basename(file, path.extname(file));
                await deployContract(items.find((item) => item.contract === contractName)!, hre);
            } catch (error) {
                logError(`Failed to deploy contract ${path.basename(file, path.extname(file))}: ${error}`);
                throw error;
            }
        }
    }
}

async function deployContract(deployItem: DeployItem, hre: HardhatRuntimeEnvironment) {
    // Skip deployment if contract already deployed
    if (_DEPLOYED[deployItem.contract]) {
        logInfo(`Skipping deployment for ${deployItem.contract} as it is already deployed.`);
        return;
    }

    // Check for cyclic dependencies
    checkForCyclicDependencyProblem(deployItem);
    addToCurrentlyDeploying(deployItem);

    let ctorParams = deployItem.args;
    if (ctorParams) {
        ctorParams = await resolveParams(ctorParams, hre);
    }
    try {
        const deployWithParams = ctorParams && ctorParams.length > 0
            // @ts-ignore
            ? await hre.viem.deployContract(deployItem.contract, ctorParams)
            // @ts-ignore
            : await hre.viem.deployContract(deployItem.contract);

        logSuccess(`>>>> Deployed ${deployItem.contract} ==> ${deployWithParams.address}`);
        // Store the deployed contract address using contractName as the key
        _DEPLOYED[deployItem.contract] = deployWithParams.address;
    } catch (error) {
        logError(`Deployment of ${deployItem.contract} failed: ${error}`);
        throw error;
    } finally {
        // Remove the contract from the deploying stack to allow further deployments
        removeFromCurrentlyDeploying(deployItem);
    }
}

function addToCurrentlyDeploying(deployItem: DeployItem) {
    _DEPLOYING.push(deployItem.contract);
}

function removeFromCurrentlyDeploying(deployItem: DeployItem) {
    const index = _DEPLOYING.indexOf(deployItem.contract);
    if (index > -1) {
        _DEPLOYING.splice(index, 1);
    }
}

function checkForCyclicDependencyProblem(deployItem: DeployItem) {
    if (_DEPLOYING.includes(deployItem.contract)) {
        throw new Error(`Cyclic dependency detected while deploying ${deployItem.contract}. Deployment path: ${_DEPLOYING.join(' -> ')} -> ${deployItem.contract}`);
    }
}

async function resolveParams(ctorParams: any[] | undefined, hre: HardhatRuntimeEnvironment) {
    ctorParams = await Promise.all(ctorParams!.map(async (param) => {
        if (param.startsWith('@')) {
            return await resolveAddressParam(param, hre);
        }
        return param;
    }));
    return ctorParams;
}

async function resolveAddressParam(param: any, hre: HardhatRuntimeEnvironment) {
    const contractName = param.slice(1); // Remove '@' from the start
    let deployedAddress = _DEPLOYED[contractName];
    if (!deployedAddress) {
        logInfo(`Deploying missing dependency: ${contractName}`);
        await deployContract({ contract: contractName }, hre);
        deployedAddress = _DEPLOYED[contractName];
        if (!deployedAddress) {
            throw new Error(`Failed to deploy and resolve address for ${contractName}.`);
        }
    }
    logInfo(`Resolved dependency: ${param} => ${deployedAddress}`);
    return deployedAddress;
}

