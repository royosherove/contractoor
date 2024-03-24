import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import pkg from '../package.json';

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
const deployedContracts: Record<string, string> = {};

// Helper functions for logging with color
function startLogo() {

    const version = pkg.version.trim();
    console.log(chalk.magentaBright(`
 **************************************************
 ____ ____ __ _ ___ ____ ____ ____ ___ ____ ____
 |___ [__] | \|  |  |--< |--| |___  |  [__] |--<

 v${version}
 **************************************************
`));
}

function logInfo(message: string) {
    console.log(chalk.blue(message));
}

function logSuccess(message: string) {
    console.log(chalk.green(message));
}

function logError(message: string) {
    console.error(chalk.red(message));
}

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
    if (deployedContracts[deployItem.contract]) {
        logInfo(`Skipping deployment for ${deployItem.contract} as it is already deployed.`);
        return;
    }

    let ctorParams = deployItem.args;
    if (ctorParams) {
        ctorParams = await resolveParams(ctorParams, hre);
    }
    try {
        const deployWithParams = ctorParams && ctorParams.length > 0
            ? await hre.viem.deployContract(deployItem.contract, ctorParams)
            : await hre.viem.deployContract(deployItem.contract);

        logSuccess(`>>>> Deployed ${deployItem.contract} ==> ${deployWithParams.address}`);
        // Store the deployed contract address using contractName as the key
        deployedContracts[deployItem.contract] = deployWithParams.address;
    } catch (error) {
        logError(`Deployment of ${deployItem.contract} failed: ${error}`);
        throw error;
    }
}

async function resolveParams(ctorParams: any[] | undefined, hre: HardhatRuntimeEnvironment) {
    ctorParams = await Promise.all(ctorParams!.map(async (param) => {
        if (param.startsWith('@')) {
            const contractName = param.slice(1); // Remove '@' from the start
            let deployedAddress = deployedContracts[contractName];
            if (!deployedAddress) {
                logInfo(`Deploying missing dependency: ${contractName}`);
                await deployContract({contract: contractName}, hre);
                deployedAddress = deployedContracts[contractName];
                if (!deployedAddress) {
                    throw new Error(`Failed to deploy and resolve address for ${contractName}.`);
                }
            }
            logInfo(`Resolved dependency: ${param} => ${deployedAddress}`);
            return deployedAddress;
        }
        return param;
    }));
    return ctorParams;
}

