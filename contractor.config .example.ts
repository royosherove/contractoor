import { ConfigParams } from "./src/engine";


const config: ConfigParams = {
    contracts: [
        {
            contract: "MyParentContract"
        },
        {
            contract: "ChildContract",
            args: ["@ParentContract"], //<-- This uses the address of the deployed ParentContract
        }
    ]
};
export default config;




