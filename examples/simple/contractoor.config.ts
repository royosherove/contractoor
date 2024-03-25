import { ConfigParams } from "contractoor";
import dotenv from 'dotenv';

dotenv.config();
const env = process.env;


const config: ConfigParams = {
    contracts: [
        {
            contract: "CounterManager",
            args: [env.OWNER_ADDRESS],
        },
        {
            contract: "Counter",
            args: ["@CounterManager"],
        },
        {
            contract: "ShouldBeInitialized",
            initializeWith: ["@CounterManager"],
        }

    ]
};

export default config;
