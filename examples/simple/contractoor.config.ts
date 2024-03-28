import { ConfigParams } from "contractoor";
import dotenv from 'dotenv';

dotenv.config();
const env = process.env;


const config: ConfigParams = {
    contracts: [
        {
            contract: "CounterManager",
            args: [env.OWNER_ADDRESS], //env variable using dotenv
        },
        {
            contract: "Counter",
            // will deploy CounterManager first and pass its address as an argument to Counter's constructor
            args: ["@CounterManager"], // constructor arguments
        },
        {
            contract: "ShouldBeInitialized",
            // after deployment, will call the initialize() function of the contract with the given arguments
            initializeWith: ["@CounterManager"],
        },
        {
            contract: "VerifiedChild",
            // initializeWith: ["@VerifiedParent"],
            actions: [
                { target: "@VerifiedParent", command: "allowChild", args: ["@VerifiedChild"] },
                { target: "@VerifiedChild", command: "initialize", args: ["@VerifiedParent"] },
            ]
        },
        {
            contract: "VerifiedParent",
        }

    ]
};

export default config;
