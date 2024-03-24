import chalk from 'chalk';
const pkg = require('../package.json');

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

export function logInfo(message: string) {
    console.log(chalk.blue(message));
}

export function logSuccess(message: string) {
    console.log(chalk.green(message));
}

export function logError(message: string) {
    console.error(chalk.red(message));
}
