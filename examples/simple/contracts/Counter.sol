// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Counter {
    uint256 public number;
    address counterManagerAddress;
    // add contructor to set the address of the CounterManager

    constructor(address _counterManagerAddress) {
        counterManagerAddress = _counterManagerAddress;
    }

     



    function getManagerAddress() public view returns (address) {
        return counterManagerAddress;
    }

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    function increment() public {
        number++;
    }
}
