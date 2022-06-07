// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./interfaces/IUndelegationHolder.sol"; 
import "./interfaces/IAddressStore.sol";

contract UndelegationHolder is IUndelegationHolder {

    
    error UnknownSender();
    IAddressStore public addressStore;
    address stakePool;


     /**
     * @dev Checks that the msg sender is the expected sender address.
     */

    modifier onlySender(address expectedSender) {
        _onlySender(expectedSender);
        _;
    }
    function _onlySender(address expectedSender) private view {
        if (msg.sender != expectedSender) {
            revert UnknownSender();
        }
    }


    constructor() {
        
    }

    receive() external override payable {
        emit Received(msg.sender, msg.value);
    }

    function withdrawUnbondedBNB() external override onlySender(addressStore.getStkBNB()) returns (uint256 balance) {

        //require(msg.sender == addressStore.getStkBNB(), "unknown sender");
        balance = address(this).balance;
        payable (addressStore.getStakePool()).transfer(address(this).balance);
    }





}
