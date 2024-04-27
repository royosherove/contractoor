import pkg from '../package.json';
import chalk from 'chalk';
import { DeployItem } from './interfaces';
import { format } from 'path';

let depth=0;
let _hre:any;
let _currentBalance=0;

export function logSetBalance(balance:string){
//    format from gwei to eth // 
    _currentBalance =  parseFloat(balance)/1e18; 
    // round off to 4 decimal places
    _currentBalance = Math.round(_currentBalance*10000)/10000;
}
export function logInit(hre:any){
    _hre=hre;
}

export function onStartDeploy(item:DeployItem){
    // logInfo(`${item.contract}:`);
    logSpecial(`Deploying ${item.contract}...`);
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
    return `|${new Date().toLocaleTimeString()} | ${_currentBalance||''} ETH ${'-'.repeat(depth*2)}> ${message}`;
    
}

export function logInfo(message: string) {
    console.log(fmt(chalk.blue(message)));
}

export function logSpecial(message: string) {
    console.log(fmt(chalk.underline(chalk.bold(chalk.cyan(message)))));
}



export function onFunctionCallSuccess(message: string) {
console.log(fmt(chalk.yellow(`⚡ ${message}`)));
}

export function logSuccess(message: string) {
    console.log(fmt(chalk.green(`✅ ${message}`)));
}

export function logError(message: string) {
    console.log(fmt(chalk.red(message)));
}
