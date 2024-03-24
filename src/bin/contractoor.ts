import { Command } from 'commander';
import { logInfo, logSuccess } from '../loggingUtil';
const fs = require('fs');
const path = require('path');

const program = new Command();

program
    .command('init')
    .description('Initialize a new contractoor configuration in root')
    .action(() => {
        generateFileFromConfig();
    });


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
