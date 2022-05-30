// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/**
 * @title StakePool Bot
 * @dev The functionalities required from the StakePool contract by the bot. This contract should
 * be inherited by the StakePool contract.
 */
abstract contract StakePoolBot {

    /**
     * @dev The amount that needs to be unbonded in the next unstaking epoch.
     * This is queried by the bot in order to initiate unbonding.
     * Call frequency: Weekly
     */
    uint256 public bnbToUnbond;

    /**
     * @dev The amount of BNB that is unbonding in the current unstaking epoch.
     */
    uint256 public bnbUnbonding;

    /**
     * @dev The amount of BNB that is needed in the contract to satisfy the claims for which
     * cooldown period has finished.
     */
    uint256 public claimReserve;

    /**
     * @return The amount of BNB that can be staked. This would be same as the amount that would
     * reach BC, if initiateDelegation() were called.
     */
    function getStakableBNB() external virtual view returns (uint256);


    /**
     * @dev This is called by the bot in order to transfer the stakable BNB from contract to the
     * staking address on BC.
     * Call frequency: Daily
     *
     * @return The amount of stakable BNB that were transferred to the staking address on BC.
     */
    function initiateDelegation() external virtual returns (uint256);

    /**
     * @dev Called by the bot to update the exchange rate in contract based on the rewards
     * obtained in the BC staking address and accordingly mint fee tokens.
     * Call frequency: Daily
     *
     * @param bnbRewards: The amount of BNB which were received as staking rewards.
     */
    function notifyRewards(uint256 bnbRewards) external virtual;

    /**
     * @dev This is called by the bot after it has executed the unbond transaction on BC.
     * Call frequency: Weekly
     *
     * @param bnbUnbonding: The amount of BNB for which unbonding was initiated on BC.
     */
    function unbondingInitiated(uint256 bnbUnbonding) external virtual;

    /**
     * @dev Called by the bot after the unbonded amount for claim fulfilment is received in BC
     * and has been transferred to the UndelegationHolder contract on BSC.
     * It calls UndelegationHolder.withdrawUnbondedBNB() to fetch the unbonded BNB to itself and
     * update `bnbUnbonding` and `claimReserve`.
     * Call frequency: Weekly
     */
    function unbondingFinished() external virtual;
}

