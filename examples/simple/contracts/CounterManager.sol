// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract CounterManager {
    address public owner;
    
    constructor(address _owner) {
        owner = _owner;
    }
}
