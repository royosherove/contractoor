"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox-viem");
// import { task } from "hardhat/config";
const engine_1 = require("./src/engine"); // Adjust the path as necessary
const config = {
    solidity: "0.8.24",
};
// Define a new task called "deploy-contracts"
(0, config_1.task)("deploy", "Deploys contracts based on the configuration", async (_, hre) => {
    await hre.run('compile'); // Ensure contracts are compiled before deployment
    const rootDir = "./contracts"; // Specify the root directory for your contracts
    const configFilePath = "./contractor.config.ts"; // Specify the path to your configuration file
    await (0, engine_1.start)({ hre, rootDir, configFilePath });
}).addOptionalParam("rootDir", "The root directory for contracts")
    .addOptionalParam("configFilePath", "The configuration file path");
exports.default = config;
