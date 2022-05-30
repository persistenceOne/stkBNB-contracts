// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./interfaces/IUndelegationHolder.sol"; 

contract UndelegationHolder is IUndelegationHolder {

    address private _owner;
    address public stakePool;

    constructor() {
        _owner = msg.sender;
    }

    receive() external override payable {
        emit Received(msg.sender, msg.value);
    }

    function withdrawUnbondedBNB() external override returns (uint256 balance) {
        require(msg.sender == stakePool, "unknown sender");
        balance = address(this).balance;
        (payable (stakePool)).transfer(address(this).balance);
    }

    function setStakePool(address sp) external {
        require(msg.sender == _owner, "unknown sender");
        stakePool = sp;
    }

    function selfDestruct() external {
        require(msg.sender == _owner, "unknown sender");
        selfdestruct(payable (_owner));
    }
}