// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./interfaces/IUndelegationHolder.sol"; 
import "./interfaces/IAddressStore.sol";

contract UndelegationHolder is IUndelegationHolder {

    
    address public stakePool;

    constructor() {
        
    }

    receive() external override payable {
        emit Received(msg.sender, msg.value);
    }

    function withdrawUnbondedBNB() external override returns (uint256 balance) {
        require(msg.sender == stakePool, "unknown sender");
        balance = address(this).balance;
        (payable (stakePool)).transfer(address(this).balance);
    }





}
