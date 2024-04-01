// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

library ValidatorSet {
    error ZeroAddress(string tag, address account);
    error ValidatorDoesNotExists(address operator);
    error NonZeroValue(string tag, uint256 value);
    error InvalidParam(string tag, uint256 param);
    error SelfRedelegationNotAllowed();

    using ValidatorSet for ValidatorSet.Info;

    struct Store {
        // @dev Maps address => Validator Info
        mapping(address => Info) validators;
        // @dev List of Validators added so far
        address[] operatorsList;
    }

    struct Info {
        // @dev operator address of validator used to delegate/undelegate/redelegate
        address operator;
        // @dev Address of validator credit contract which manages the stCred token (non-transferable)
        address stCred;
        // @dev Last staked unix time
        uint256 lastStakedAt;
        // @dev Validator's Stake Info
        DelegationInfo delegation;
        // @dev The position of the validator based on its creation.
        uint256 index;
    }

    struct DelegationInfo {
        // @dev Current delegations of the validator (total BNB delegated)
        uint256 stakes;
        // @dev Amount of stCred token holdings
        uint256 shares;
        // @dev Percentage of total delegations managed by validator
        uint256 weightage;
    }

    uint256 private constant WEIGTHAGE_RATE_BASE = 10_000; // 100 %

    function _create(Info storage self, address operator, address stCred, uint256 index) internal {
        _checkCreate(operator, stCred);

        self.operator = operator;
        self.stCred = stCred;
        self.index = index;
    }

    function _checkCreate(address operator, address stCred) internal pure {
        if (operator == address(0)) {
            revert ZeroAddress("Operator Address cannot be Zero Address", operator);
        }
        if (stCred == address(0)) {
            revert ZeroAddress("Validator Credit Contract cannot be Zero Address", stCred);
        }
    }

    function _delegate(
        Info storage self,
        DelegationInfo memory newDelegation,
        uint256 stakedAt,
        uint256 totalVals
    ) internal {
        self._checkDelegate(newDelegation, stakedAt, totalVals);

        self.lastStakedAt = stakedAt;

        self.delegation.stakes += newDelegation.stakes;
        self.delegation.shares += newDelegation.shares;
        self.delegation.weightage += newDelegation.weightage;
    }

    function _checkDelegate(
        Info storage self,
        DelegationInfo memory newDelegation,
        uint256 stakedAt,
        uint256 totalVals
    ) internal view {
        if (self._isNotValidator(totalVals)) {
            revert ValidatorDoesNotExists(self.operator);
        }
        if (self.lastStakedAt > stakedAt) {
            revert InvalidParam("self.lastStakedAt > stakedAt", stakedAt);
        }
        if (self.delegation.stakes + newDelegation.stakes < self.delegation.stakes) {
            revert InvalidParam(
                "self.delegation.stakes + newDelegation.stakes < self.delegation.stakes",
                newDelegation.stakes
            );
        }
        if (self.delegation.shares + newDelegation.shares < self.delegation.shares) {
            revert InvalidParam(
                "self.delegation.shares + newDelegation.shares < self.delegation.shares",
                newDelegation.shares
            );
        }
        if (self.delegation.weightage + newDelegation.weightage < self.delegation.weightage) {
            revert InvalidParam(
                "self.delegation.weightage + newDelegation.weightage < self.delegation.weightage",
                newDelegation.weightage
            );
        }
    }

    function _undelegate(
        Info storage self,
        DelegationInfo memory newUndelegation,
        uint256 totalVals
    ) internal {
        self._checkUndelegate(newUndelegation, totalVals);

        self.delegation.stakes -= newUndelegation.stakes;
        self.delegation.shares -= newUndelegation.shares;
        self.delegation.weightage -= newUndelegation.weightage;
    }

    function _checkUndelegate(
        Info storage self,
        DelegationInfo memory newUndelegation,
        uint256 totalVals
    ) internal view {
        if (self._isNotValidator(totalVals)) {
            revert ValidatorDoesNotExists(self.operator);
        }
        if (self.delegation.stakes - newUndelegation.stakes > self.delegation.stakes) {
            revert InvalidParam(
                "self.delegation.stakes - newUndelegation.stakes > self.delegation.stakes",
                newUndelegation.stakes
            );
        }
        if (self.delegation.shares - newUndelegation.shares > self.delegation.shares) {
            revert InvalidParam(
                "self.delegation.shares - newUndelegation.shares > self.delegation.shares",
                newUndelegation.shares
            );
        }
        if (self.delegation.weightage - newUndelegation.weightage > self.delegation.weightage) {
            revert InvalidParam(
                "self.delegation.weightage - newUndelegation.weightage > self.delegation.weightage",
                newUndelegation.weightage
            );
        }
    }

    function _redelegate(
        Info storage self,
        Info storage val,
        DelegationInfo memory dstDelegation,
        DelegationInfo memory srcDelegation,
        uint256 totalVals
    ) internal {
        self._checkRedelegate(val, totalVals);

        self._delegate(dstDelegation, block.timestamp, totalVals);
        val._undelegate(srcDelegation, totalVals);
    }

    function _checkRedelegate(
        Info storage self,
        Info storage val,
        uint256 totalVals
    ) internal view {
        if (val._isNotValidator(totalVals)) {
            revert ValidatorDoesNotExists(val.operator);
        }
        if (self.operator == val.operator) {
            revert SelfRedelegationNotAllowed();
        }
    }

    function _isNotValidator(Info storage self, uint256 totalVals) internal view returns (bool) {
        return self.index == 0 || self.index > totalVals;
    }
}
