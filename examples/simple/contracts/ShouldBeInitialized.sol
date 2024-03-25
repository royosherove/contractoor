// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

contract ShouldBeInitialized {
    address public owner;
    address public secondOwner;

    constructor() {
        owner = msg.sender;
    }

    function initialize(address _secondOwner) public {
        require(msg.sender == owner, "Only the owner can initialize.");
        secondOwner = _secondOwner;
    }

    function getSecondOwner() public view returns (address) {
        return secondOwner;
    }
}
