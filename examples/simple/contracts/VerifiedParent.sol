// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

contract VerifiedParent {
   address _owner; 
   mapping(address => bool) public verifiedChildren;
   uint called = 0;

   function getCalled() public view returns (uint) {
       return called;
    }
    

    constructor() {
        _owner = msg.sender;
    }

    function allowChild(address child) public {
        require(msg.sender == _owner, "Only the owner can verify children.");
        verifiedChildren[child] = true;
    }

   function onlyCallIfVerifiedChild() public {
        require(verifiedChildren[msg.sender], "Only verified children can call this function.");
        called +=1;
    } 

}
