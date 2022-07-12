//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "../../contracts/StakePool.sol";

contract StakePoolHarness is StakePool {
    function getWeiToReturn(address user, uint256 index) public view returns (uint256) {
        return claimReqs[user][index].weiToReturn;
    }

    function getPoolTokenSupply() public view returns (uint256) {
        return exchangeRate.poolTokenSupply;
    }

    function getTotalWei() public view returns (uint256) {
        return exchangeRate.totalWei;
    }

    function getSTKBNB() public view returns (address){
        return addressStore.getStkBNB();
    }
    
}