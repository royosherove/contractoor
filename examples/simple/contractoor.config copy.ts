
const config= {
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
