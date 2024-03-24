import { ConfigParams } from "./src/engine";

const COUNTER_MANAGER = "CounterManager";
const COUNTER = "Counter";

const config: ConfigParams = {
    contracts: [
        { contract: COUNTER_MANAGER },
        {
            contract: COUNTER,
            args: [`@${COUNTER_MANAGER}`],
            dependencies: [COUNTER_MANAGER]
        }
    ]
};

export default config;
