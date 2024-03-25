// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

contract CounterManager {
    address public owner;
    
    constructor(address _owner) {
        owner = _owner;
    }
}
