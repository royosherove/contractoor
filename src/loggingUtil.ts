import pkg from '../package.json';
import chalk from 'chalk';
import { DeployItem } from './interfaces';
import { format } from 'path';

let depth=0;
export function onStartDeploy(item:DeployItem){
    logInfo(`${item.contract}:`);
    depth++;
}

export function onEndDeploy(item:DeployItem){
    depth--;
}
export function startLogo() {

    const version = pkg.version.trim();
    console.log(chalk.magentaBright(`
 **************************************************
 
░░      ░░░      ░░   ░░░  ░        ░       ░░░      ░░░      ░░        ░░      ░░░      ░░       ░░
▒  ▒▒▒▒  ▒  ▒▒▒▒  ▒    ▒▒  ▒▒▒▒  ▒▒▒▒  ▒▒▒▒  ▒  ▒▒▒▒  ▒  ▒▒▒▒  ▒▒▒▒  ▒▒▒▒  ▒▒▒▒  ▒  ▒▒▒▒  ▒  ▒▒▒▒  ▒
▓  ▓▓▓▓▓▓▓  ▓▓▓▓  ▓  ▓  ▓  ▓▓▓▓  ▓▓▓▓       ▓▓  ▓▓▓▓  ▓  ▓▓▓▓▓▓▓▓▓▓  ▓▓▓▓  ▓▓▓▓  ▓  ▓▓▓▓  ▓       ▓▓
█  ████  █  ████  █  ██    ████  ████  ███  ██        █  ████  ████  ████  ████  █  ████  █  ███  ██
██      ███      ██  ███   ████  ████  ████  █  ████  ██      █████  █████      ███      ██  ████  █
                                                                                                    
    ${pkg.name}
    v${version}
    ${pkg.description}
 **************************************************
`));
}

function fmt(message:string){
    return `|${'_'.repeat(depth*2)}| ${message}`;
}

export function logInfo(message: string) {
    console.log(fmt(chalk.blue(message)));
}

export function logSuccess(message: string) {
    console.log(fmt(chalk.green(message)));
}

export function logError(message: string) {
    console.log(fmt(chalk.red(message)));
}
