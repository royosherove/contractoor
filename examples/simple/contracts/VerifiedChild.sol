// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

interface IVerifiedParent {
    function onlyCallIfVerifiedChild() external;
}

contract VerifiedChild {
    uint _someNumber;
    address _parent;
    address _owner;
    bool public initialized;

    constructor(uint someNumber) {
        _owner = msg.sender;
        _someNumber = someNumber;
    }
    function initialize(address parent) public {
        require(_owner == msg.sender, "Only the owner can initialize.");
        require(!initialized, "Already initialized");
        initialized = true;

        _parent = parent;
        IVerifiedParent(_parent).onlyCallIfVerifiedChild();
    }
}
