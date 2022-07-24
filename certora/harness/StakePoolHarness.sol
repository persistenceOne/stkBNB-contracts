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
 
    /* function getTokensByExchangeRate(uint256 twei) public view returns (uint256) {
        return exchangeRate._calcPoolTokensForDeposit(twei);
    }*/

    function getSTKBNB() public view returns (address){
        return addressStore.getStkBNB();
    }
     function getStakePoolAddress() public view returns (address){
        return addressStore.getStakePool();
    }

    function getClaimRequestLength(address user) public view returns (uint256) {
        return claimReqs[user].length;
    }

     function getClaimRequestTimestamp(address user, uint256 index) public view returns (uint256) {
        return claimReqs[user][index].createdAt;
    }

    function getCooldownPeriod() public view returns (uint256) {
        return config.cooldownPeriod;
    }

    function bnbBalanceOf(address user) public view returns (uint256) {
        return user.balance;
    }

    function canBeClaimed(uint256 index) public view returns (bool) {
            ClaimRequest memory req = claimReqs[msg.sender][index];
        return _canBeClaimed(req);
    }

}