//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "../../contracts/StakedBNBToken.sol";

contract StakedBNBTokenHarness is StakedBNBToken {
    constructor(IAddressStore addressStore_) StakedBNBToken(addressStore_) {}

    function getStkBnbAddress() public view returns (address) {
        return _addressStore.getStkBNB();
    }

    function getStakePoolAddress() public view returns (address) {
        return _addressStore.getStakePool();
    }

    function getTimelockedAdminAddress() public view returns (address) {
        return _addressStore.getTimelockedAdmin();
    }
}
