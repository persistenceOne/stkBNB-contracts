//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "../../contracts/UndelegationHolder.sol";

contract UndelegationHolderHarness is UndelegationHolder{

    constructor(IAddressStore addressStore_) UndelegationHolder( addressStore_) {
   }
    function bnbBalanceOf(address user) public view returns (uint256) {
        return user.balance;
    }

}
