// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./FeeDistribution.sol";

library Config {
    using Config for Data;
    using FeeDistribution for FeeDistribution.Data;

    error MustBeGreaterThanZero();
    error CantBeMoreThan1e18();
    error CooldownPeriodOutOfRange();

    struct Data {
        // This variable is used to prevent storage collisions while proxy upgrades
        /// @custom:oz-renamed-from bscStakingWallet
        address bcStakingWallet_deprecated;
        // @dev The minimum amount of BNB required to make delegation on BSC Native Staking Module.
        // This should be at least minDelegationBNBChange in the StakeHub Contract.
        // Ideally, this should be set to a value such that the protocol revenue from this value is more than the fee
        // lost on this value for Native Staking Module delegation/undelegation/redelegation/etc.
        // But, finding the ideal value is non-deterministic.
        /// @custom:oz-renamed-from minCrossChainTransfer
        uint256 minDelegationAmount;
        // This variable is used to prevent storage collisions while proxy upgrades
        /// @custom:oz-renamed-from transferOutTimeout
        uint256 transferOutTimeout_deprecated;
        // @dev The minimum amount of BNB required to make a deposit to the contract.
        uint256 minBNBDeposit;
        // @dev The minimum amount of tokens required to make a withdrawal from the contract.
        uint256 minTokenWithdrawal;
        // @dev The minimum amount of time (in seconds) a user has to wait after unstake to claim their BNB.
        // It would be 15 days on mainnet. 3 days on testnet.
        uint256 cooldownPeriod;
        // @dev The fee distribution to represent different kinds of fee.
        FeeDistribution.Data fee;
    }

    uint256 public constant MAX_ALLOWED_COOLDOWN_PERIOD = 30 days;
    uint256 public constant MIN_ALLOWED_COOLDOWN_PERIOD = 7 days;

    function _init(Data storage self, Data calldata obj) internal {
        obj._checkValid();
        self._set(obj);
    }

    function _checkValid(Data calldata self) internal pure {
        self.fee._checkValid();
        if (self.minDelegationAmount == 0) {
            revert MustBeGreaterThanZero();
        }
        if (self.minBNBDeposit > 1e18) {
            revert CantBeMoreThan1e18();
        }
        if (self.minTokenWithdrawal > 1e18) {
            revert CantBeMoreThan1e18();
        }
        if (
            self.cooldownPeriod > MAX_ALLOWED_COOLDOWN_PERIOD ||
            self.cooldownPeriod < MIN_ALLOWED_COOLDOWN_PERIOD
        ) {
            revert CooldownPeriodOutOfRange();
        }
    }

    function _set(Data storage self, Data calldata obj) internal {
        self.minDelegationAmount = obj.minDelegationAmount;
        self.minBNBDeposit = obj.minBNBDeposit;
        self.minTokenWithdrawal = obj.minTokenWithdrawal;
        self.cooldownPeriod = obj.cooldownPeriod;
        self.fee._set(obj.fee);
    }
}
