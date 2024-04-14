// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

import "../embedded-libs/ValidatorSet.sol";

/**
 * @title StakePool Bot
 * @dev The functionalities required from the StakePool contract by the bot. This contract should
 * be implemented by the StakePool contract.
 */
interface IStakePoolBot {
    /**
     * @dev The amount that needs to be unbonded in the next unstaking epoch.
     * It increases on every user unstake operation, and decreases when the bot initiates unbonding.
     * This is queried by the bot in order to initiate unbonding.
     * It is int256, not uint256 because bnbUnbonding can be more than it and is subtracted from it.
     * So, if it is < 0, means we have already initiated unbonding for that much amount and eventually
     * that amount would be part of claimReserve. So, we don't need to unbond anything new on the BBC
     * side as long as this value is negative.
     *
     * Increase frequency: anytime
     * Decrease frequency & Bot query frequency:
     *      Mainnet: Weekly
     *      Testnet: Daily
     */
    function bnbToUnbond() external view returns (int256);

    /**
     * @dev The amount of BNB that is unbonding in the current unstaking epoch.
     * It increases when the bot initiates unbonding, and decreases when the unbonding is finished.
     * It is queried by the bot before calling unbondingFinished(), to figure out the amount that
     * needs to be moved from BBC to BSC.
     *
     * Increase, Decrease & Bot query frequency:
     *      Mainnet: Weekly
     *      Testnet: Daily
     */
    function bnbUnbonding() external view returns (uint256);

    /**
     * @dev A portion of the contract balance that is reserved in order to satisfy the claims
     * for which the cooldown period has finished. This will never be sent to BBC for staking.
     * It increases when the unbonding is finished, and decreases when any user actually claims
     * their BNB.
     *
     * Increase frequency:
     *      Mainnet: Weekly
     *      Testnet: Daily
     * Decrease frequency: anytime
     */
    function claimReserve() external view returns (uint256);

    /**
     * @dev The quantity of BNB within the stakepool contract, designated for delegation to the
     * BSC Native Staking Module by the bot, at the commencement of the subsequent Epoch.
     *
     * Increase frequency:
     *      Mainnet: Daily
     *      Testnet: Daily
     *
     * Decrease frequency: anytime
     */
    function getDeposits() external view returns (uint256);

    /**
     * @dev Returns a specific Validator
     */
    function getValidator(address operator) external view returns (ValidatorSet.Info memory);

    /**
     * @dev Returns a list of all Validators
     */
    function getValidators() external view returns (ValidatorSet.Info[] memory);

    /**
     * @dev Returns the total number of validators
     */
    function getTotalValidators() external view returns (uint256);

    /**
     *
     * BOT FUNCTIONS
     *
     */

    /**
     * @dev epochUpdate: Accessible to any user and can be invoked once daily to adjust the exchange rate.
     * The adjustment is based on the total rewards accumulated by all validators, ensuring that
     * the rate reflects the latest reward dynamics and accordingly mint fee tokens.
     *
     * Requirements:
     *
     * - Can only be called once per day
     *
     * Call frequency:
     *      Mainnet: Daily
     *      Testnet: Daily
     */
    function epochUpdate() external;

    /**
     * @dev createValidator: Called by the Bot to add a new validator to the validator set.
     * It is allowed to create validator even when the contract is paused.
     *
     * Requirements:
     *
     * - The caller must have the BOT_ROLE.
     */
    function createValidator(address operator_) external;

    /**
     * @dev enableValidator: Called by the Bot to reactivate the disabled Validator.
     * It is allowed to activate validator even when the contract is paused.
     *
     * Requirements:
     *
     * - The caller must have the BOT_ROLE.
     */
    function enableValidator(address operator_) external;

    /**
     * @dev disableValidator: Called by the Bot to deactivate the Validator.
     * It is allowed to deactivate validator even when the contract is paused.
     *
     * Requirements:
     *
     * - The caller must have the BOT_ROLE.
     */
    function disableValidator(address operator_, ValidatorSet.Status status_) external;

    /**
     * @dev This is called by the bot in order to transfer the stakable BNB from contract to the
     * stakehub contract on BSC Native Staking Module.
     *
     * Call frequency:
     *      Mainnet: Daily
     *      Testnet: Daily
     *
     * @param operators_  : A list of Validator Operators to delegate to.
     * @param bnbAmounts_ : A list of bnb delegation amounts given by the bot
     *
     */
    function initiateDelegation(
        address[] calldata operators_,
        uint256[] calldata bnbAmounts_
    ) external;

    /**
     * @dev This is called by the bot in order to redelegate BNB from one Validator
     * to another Validator provided that the new validator exists
     *
     * Requirements:
     *
     * - The caller must be bot.
     *
     * @param srcOperator_  : Source Validator Operator to undelegate from
     * @param dstOperator_  : Destination Validator Operator to delegate to
     * @param srcRestakes_  : Total stakes to redelegate
     *
     */
    function initiateRedelegation(
        address srcOperator_,
        address dstOperator_,
        uint256 srcRestakes_
    ) external;

    /**
     * @dev This is called by the bot to undelegate 'bnbToUnbond' funds from the BSC Native Staking Module.
     *
     * Requirements:
     *
     * - The caller must be bot.
     *
     * Call frequency:
     *      Mainnet: Weekly
     *      Testnet: Daily
     *
     * @param operators_       : The list of validators to undelegate from.
     * @param bnbUnbondValues_ : The list contains bnb unbonding amounts from the respective validators.
     *                           It will be calculated by the bot.
     *                           It can be more than bnbToUnbond in total, but within a factor of minUndelegation amount (1 BNB).
     */
    function unbondingInitiated(
        address[] calldata operators_,
        uint256[] calldata bnbUnbondValues_
    ) external;

    /**
     * @dev Called by the bot after the unbonded amount for claim fulfilment is received in Validator Credit Contract
     * It calls StakeHub.claimBatch() to fetch the unbonded BNB to itself from the above contract and
     * update `bnbUnbonding` and `claimReserve`.
     *
     * Requirements:
     *
     * - The caller must be bot.
     *
     * Call frequency:
     *      Mainnet: Weekly
     *      Testnet: Daily
     *
     */
    function unbondingFinished() external;
}
