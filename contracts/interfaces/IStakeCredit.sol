// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.7;

interface IStakeCredit {
    /**
     *
     * DELEGATOR FUNCTIONS
     *
     */
    function delegate(address delegator) external payable returns (uint256);
    function undelegate(address delegator, uint256 shares) external returns (uint256);
    function unbond(address delegator, uint256 shares) external returns (uint256);
    function claim(address payable delegator, uint256 requestNumber) external returns (uint256);

    /**
     *
     * VIEW FUNCTIONS
     *
     */
    function totalPooledBNB() external view returns (uint256);
    function getPooledBNB(address account) external view returns (uint256);
    function getPooledBNBByShares(uint256 shares) external view returns (uint256);
    function getSharesByPooledBNB(uint256 bnbAmount) external view returns (uint256);
    function rewardRecord(uint256 dayIndex) external view returns (uint256);
    function totalPooledBNBRecord(uint256 dayIndex) external view returns (uint256);
    function claimableUnbondRequest(address delegator) external view returns (uint256);
    function pendingUnbondRequest(address delegator) external view returns (uint256);
    function lockedBNBs(address delegator, uint256 number) external view returns (uint256);

    /**
     *
     * StCred TOKEN FUNCTIONS
     *
     */
    function balanceOf(address delegator) external view returns (uint256);
    function totalSupply() external view returns (uint256);
}
