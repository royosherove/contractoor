
import { ConfigParams } from "../../src/engine";

const config: ConfigParams = {
    contracts: [
        {
            contract: "CounterManager"
        },
        {
            contract: "Counter",
            args: ["@CounterManager"],
            dependencies: ["CounterManager"]
        }
    ]
};

export default config;
