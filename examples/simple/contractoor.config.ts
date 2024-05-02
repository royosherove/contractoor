import { ConfigParams } from "contractoor";
import dotenv from 'dotenv';

dotenv.config();
const env = process.env;


const config: ConfigParams = {
    contracts: [
        {
            contract: "CounterManager",
            verify: true, 
            args: [env.OWNER_ADDRESS], //env variable using dotenv
        },
        {
            contract: "Counter",
            verify: true, 
            // will deploy CounterManager first and pass its address as an argument to Counter's constructor
            args: ["@CounterManager"], // constructor arguments
            dependencies: ["@VerifiedChild"], // dependencies
        },
        {
            contract: "ShouldBeInitialized",
            verify: true, 
            // after deployment, will call the initialize() function of the contract with the given arguments
            initializeWith: ["@CounterManager"],
        },
        {
            contract: "VerifiedChild",
            verify: true, 
            args: [1],
            initializeWith: ["@VerifiedParent"],
            actions: [
                { target: "@VerifiedParent", command: "allowChild", args: ["@VerifiedChild"] },
            ]
        },
        {
            contract: "VerifiedParent",
            verify: true, 
        }

    ]
};

export default config;
