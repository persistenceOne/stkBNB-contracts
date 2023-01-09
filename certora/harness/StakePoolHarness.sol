//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "../../contracts/StakePool.sol";

contract StakePoolHarness is StakePool {
    /* Exchange Rate Params */
    function getTotalWei() public view returns (uint256) {
        return exchangeRate.totalWei;
    }

    function getPoolTokenSupply() public view returns (uint256) {
        return exchangeRate.poolTokenSupply;
    }

    /* function getTokensByExchangeRate(uint256 twei) public view returns (uint256) {
        return exchangeRate._calcPoolTokensForDeposit(twei);
    }*/

    /* Address Store Params */
    function getStkBnbAddress() public view returns (address) {
        return _addressStore.getStkBNB();
    }

    function getStakePoolAddress() public view returns (address) {
        return _addressStore.getStakePool();
    }

    /* Claim Request Params */
    function getWeiToReturn(address user, uint256 index) public view returns (uint256) {
        return claimReqs[user][index].weiToReturn;
    }

    function getClaimRequestLength(address user) public view returns (uint256) {
        return claimReqs[user].length;
    }

    function getClaimRequestTimestamp(address user, uint256 index) public view returns (uint256) {
        return claimReqs[user][index].createdAt;
    }

    /* CONFIG Params */
    function getCooldownPeriod() public view returns (uint256) {
        return config.cooldownPeriod;
    }

    function getbcStakingWallet() public view returns (address) {
        return config.bcStakingWallet;
    }

    function getMinBNBDeposit() public view returns (uint256) {
        return config.minBNBDeposit;
    }

    function getMinTokenWithdrawal() public view returns (uint256) {
        return config.minTokenWithdrawal;
    }

    function getFee() public view returns (uint256, uint256, uint256) {
        return (config.fee.reward, config.fee.deposit, config.fee.withdraw);
    }

    function bnbBalanceOf(address user) public view returns (uint256) {
        return user.balance;
    }

    function canBeClaimed(uint256 index) public view returns (bool) {
        ClaimRequest memory req = claimReqs[msg.sender][index];
        return _canBeClaimed(req);
    }

    function transferOut(
        address contractAddr,
        address recipient,
        uint256 amount,
        uint64 expireTime
    ) external payable returns (bool) {
        return true;
    }
}
