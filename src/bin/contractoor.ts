#!/usr/bin/env node
import { Command } from 'commander';
import { logInfo, logSuccess } from '../loggingUtil';
import path from 'path';
import fs from 'fs';
import { deplooy } from '../engine';
import hre from 'hardhat';

const program = new Command();


program
    .command('init')
    .description('Initialize a new contractoor configuration in root')
    .action(() => {
        generateFileFromConfig();
    });

// program
//     .command('deploy')
//     .description('Deploy contracts based on the configuration')
//     .action(() => {
//         logInfo('Deploying contracts...');
//         start({
//             configFilePath: './contractoor.config.ts',
//             rootDir: './contracts',
//             hre
//         });
//         // Implement the deployment logic here
//         logSuccess('Deployment completed successfully');
//     }); 


const generateFileFromConfig = () => {
    logInfo('Initializing new contractoor configuration...');
    const template = `
import { ConfigParams } from "./src/engine";

    const config: ConfigParams = {
        contracts: [ ]
    };

export default config;
`
    const configPath = path.join(process.cwd(), 'contractoor.config.ts');
    fs.writeFileSync(configPath, template);
    logSuccess('contractoor.config.ts file created successfully');
};


program.parse(process.argv);
