import fs from 'fs';
import path from 'path';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { startLogo, logInfo, logSuccess, logError, onStartDeploy, onEndDeploy, onFunctionCallSuccess, logSpecial, logInit, logSetBalance } from './loggingUtil';
import { EngineParams, DeployItem, ConfigParams, ItemAction } from './interfaces';

// Hashtable to keep track of deployed contracts' addresses
const _DEPLOYED: Record<string, string> = {};
const _DEPLOYED_INSTANCE: Record<string, any> = {};
const _DEPLOYING: string[] = [];
let _DEPLOY_CONFIG: ConfigParams;
let _hre: HardhatRuntimeEnvironment;
let DEPLOY_STATE_FILE: string;
let DEPLOY_STATE_OBJ: Record<string, any> = {};

// Helper functions for logging with color

async function getBalance() {
    // @ts-ignore
    const publicClient = await _hre.viem.getPublicClient();
    // @ts-ignore
    const [activeWallet] = await _hre.viem.getWalletClients();
    const balance = await publicClient.getBalance({address:activeWallet.account.address});
    return balance;
}

export async function deplooy(params: EngineParams) {
    _hre = params.hre;
    DEPLOY_STATE_FILE = `.deployState.${_hre.network.name}`;
    logInit(_hre);
    const startBalance = await getBalance();
    // @ts-ignore
    logSetBalance(startBalance);
    startLogo();
    logInfo(`Starting balance: ${startBalance}`)
    logInfo(`Starting deployment from root directory: ${params.rootDir}`);
    try {
        await loadDeployState();
        await loadConfigAndDeploy(params.configFilePath, params.rootDir, params.hre);
        saveDeployState();
        logSuccess('Deployment completed successfully.');
    } catch (error) {
        logError(`Deployment failed: ${error}`);
    }
}

async function loadDeployState() {
    if (fs.existsSync(DEPLOY_STATE_FILE)) {
        DEPLOY_STATE_OBJ = JSON.parse(fs.readFileSync(DEPLOY_STATE_FILE, 'utf8'));
    } else {
        fs.writeFileSync(DEPLOY_STATE_FILE, JSON.stringify({}));
    }
}

function saveDeployState() {
    fs.writeFileSync(DEPLOY_STATE_FILE, JSON.stringify(DEPLOY_STATE_OBJ, null, 2));
}

async function loadConfigAndDeploy(configFilePath: string, rootDir: string, hre: HardhatRuntimeEnvironment) {
    try {
        const fullPath = path.resolve(configFilePath);
        const config: ConfigParams = require(fullPath).default;
        _DEPLOY_CONFIG = config;
        const contractItems = config.contracts;
        contractItems.forEach((item) => {
            logInfo(`Candidate contract: ${item.contract}`);
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
            const contractName = path.basename(file, path.extname(file));
            if (!DEPLOY_STATE_OBJ[contractName] || !DEPLOY_STATE_OBJ[contractName].deployed) {
                try {
                    await deployContract(items.find((item) => item.contract === contractName)!, hre);
                    logSetBalance(await getBalance());
                    saveDeployState(); // Save state after each deploy
                } catch (error) {
                    logError(`Failed to deploy contract ${contractName}: ${error}`);
                    throw error;
                }
            } else {
                logInfo(`Skipping deployment for ${contractName} as it is already deployed.`);
                // Check if there are any pending actions for the already deployed contract
                const deployItem = items.find((item) => item.contract === contractName);
                if (deployItem && deployItem.actions && deployItem.actions.length > 0) {
                    await callActions(deployItem, hre);
                }
            }
        }
    }
}

async function deployContract(deployItem: DeployItem, hre: HardhatRuntimeEnvironment) {
    onStartDeploy(deployItem);
    checkForCyclicDependencyProblem(deployItem);
    addToCurrentlyDeploying(deployItem);
    if(deployItem.dependencies && deployItem.dependencies.length > 0) {
        logInfo(`Checking dependencies for ${deployItem.contract} (${deployItem.dependencies.length} total)`);
        for (let i = 0; i < deployItem.dependencies.length; i++) {
            const dep = deployItem.dependencies[i] as string;
            const resolvedName = dep.slice(1); // Remove '@' from the start
            if (!_DEPLOYED[resolvedName]) {
                logInfo(`Deploying dependency: ${resolvedName}`);
                await deployContract(findDeployItem(resolvedName), hre);
            }
        }
    }

    let ctorParams = deployItem.args;
    let initializeParams = deployItem.initializeWith;
    if (ctorParams) {
        ctorParams = await resolveParams("constructor", ctorParams, hre);
    }
    try {
        let deployedInstance;
        const deployWithParams = ctorParams && ctorParams.length > 0
            // @ts-ignore
            ? deployedInstance = await hre.viem.deployContract(deployItem.contract, ctorParams)
            // @ts-ignore
            : deployedInstance = await hre.viem.deployContract(deployItem.contract);

        logSuccess(`Deployed ${deployItem.contract} ==> ${deployWithParams.address}`);
        _DEPLOYED[deployItem.contract] = deployWithParams.address;
        _DEPLOYED_INSTANCE["@" + deployItem.contract] = deployedInstance;
        logSpecial(`Deployed ${deployItem.contract} at ${_DEPLOYED_INSTANCE["@" + deployItem.contract].address}`);
        DEPLOY_STATE_OBJ[deployItem.contract] = { deployed: true, address: deployWithParams.address, actions: {} };
        saveDeployState(); // Save state after each deploy

        if (initializeParams) {
            initializeParams = await resolveParams("initialize", initializeParams, hre);
            logInfo(`calling ${deployItem.contract}.initialize(${initializeParams!.join(',')})`);
            const txHash = await deployedInstance.write.initialize(initializeParams);
            logInfo(`Waiting for transaction receipt: ${txHash}`);
            // @ts-ignore
            const publicClient = await hre.viem.getPublicClient();
            // @ts-ignore
            const txR = await publicClient.waitForTransactionReceipt ({hash: txHash});
            logInfo("included in block: " + txR.blockNumber);
            logSetBalance(await getBalance());
            onFunctionCallSuccess(`called ${deployItem.contract}.initialize(${initializeParams!.join(',')})`);
            saveDeployState(); // Save state after initialize call
        }
        logSpecial(`Performing actions for ${deployItem.contract} `);
        if (deployItem.actions && deployItem.actions.length > 0) {
            await callActions(deployItem, hre);
        }
    } catch (error) {
        logError(`Deployment of ${deployItem.contract} failed: ${error}`);
        throw error;
    } finally {
        onEndDeploy(deployItem);
        removeFromCurrentlyDeploying(deployItem);
    }
}

async function callActions(deployItem: DeployItem, hre: HardhatRuntimeEnvironment) {
    if(!deployItem.actions || deployItem.actions.length === 0) {
        logInfo(`No actions to perform for ${deployItem.contract}`);
        return;
    }
    logInfo(`Performing actions for ${deployItem.contract} (${deployItem.actions.length} total)`);
    for (let i = 0; i < deployItem.actions.length; i++) {
        const act = deployItem.actions[i];
        if (!DEPLOY_STATE_OBJ[deployItem.contract].actions[act.command] || !DEPLOY_STATE_OBJ[deployItem.contract].actions[act.command].completed) {
            try {
                await callSingleAction(act, hre, deployItem); // Save state after each action call
            } catch (error) {
                logError(`Action failed for ${act.target}.${act.command} with error: ${error}`);
            }
        } else {
            logInfo(`Skipping action ${act.command} for ${deployItem.contract} as it is already completed.`);
        }
    }
}

async function callSingleAction(act: ItemAction, hre: HardhatRuntimeEnvironment, deployItem: DeployItem) {
    DEPLOY_STATE_OBJ[deployItem.contract].actions[act.command] = { pending: true, args: act.args }; // Set action state to pending
    saveDeployState(); // Save state before action call
    act.args = await resolveParams(act.command, act.args, hre);
    const targetAddress = await resolveParams("target", [act.target], hre);
    logInfo(`calling ${targetAddress}.${act.command}(${act.args!.join(',')})`);
    const contractInstance = _DEPLOYED_INSTANCE[act.target];
    if (!contractInstance) {
        throw new Error(`Contract instance not found for ${act.target}.`);
    }
    const hash = await contractInstance.write[act.command](act.args);
    logInfo(`Waiting for transaction receipt: ${hash}`);
    // @ts-ignore
    const publicClient = await hre.viem.getPublicClient();
    // @ts-ignore
    const txR = await publicClient.waitForTransactionReceipt({ hash });
    logSetBalance(await getBalance());
    logInfo("included in block: " + txR.blockNumber);
    onFunctionCallSuccess(`called ${act.target}.${act.command}(${act.args!.join(',')})`);
    DEPLOY_STATE_OBJ[deployItem.contract].actions[act.command] = { completed: true, args: act.args };
    saveDeployState();
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

async function resolveParams(paramType: string, args: any[] , hre: HardhatRuntimeEnvironment) {
    logInfo(`Resolving ${paramType} args: (${args!.length} total)`);
    for (let i = 0; i < args!.length; i++) {
        if ( args![i].startsWith && 
             args![i].startsWith('@')) {
            args![i] = await resolveAddressParam(args![i], hre);
        } else {
            logInfo(`Arg: "${args![i]}" used as is`);
        }
    }
    return args;
}

async function resolveAddressParam(param: any, hre: HardhatRuntimeEnvironment) {
    logInfo(`Resolving arg: ${param}`);
    const contractName = param.slice(1); // Remove '@' from the start
    let deployedAddress = _DEPLOYED[contractName];
    if (!deployedAddress) {
        logInfo(`Deploying missing dependency: ${contractName}`);
        await deployContract(findDeployItem(contractName), hre);
        deployedAddress = _DEPLOYED[contractName];
        if (!deployedAddress) {
            throw new Error(`Failed to deploy and resolve address for ${contractName}.`);
        }
    }
    logInfo(`Arg: ${param} => ${deployedAddress}`);
    return deployedAddress;
}

function findDeployItem(contractName: any): DeployItem {
    const found = _DEPLOY_CONFIG.contracts.find((item) => item.contract === contractName);
    if (!found) {
        throw new Error(`Contract ${contractName} not found in configuration. (arg dependency not found)`);
    }
    return found;
}

