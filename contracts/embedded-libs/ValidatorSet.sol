// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

library ValidatorSet {
    error ZeroAddress(string tag, address account);
    error ValidatorDoesNotExists(address operator);
    error ValidatorAlreadyActive();
    error NonZeroValue(string tag, uint256 value);
    error InvalidParam(string tag, uint256 param);
    error SelfRedelegationNotAllowed();

    using ValidatorSet for ValidatorSet.Info;
    using ValidatorSet for ValidatorSet.DelegationInfo;

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
        // @dev
        Status status;
    }

    struct DelegationInfo {
        // @dev Current delegations of the validator (total BNB delegated)
        uint256 stakes;
        // @dev Amount of stCred token holdings
        uint256 shares;
    }

    enum Status {
        Inactive,
        Active,
        Jailed
    }

    uint256 private constant WEIGTHAGE_RATE_BASE = 10_000; // 100 %

    function _create(Info storage self, Info memory newVal) internal {
        newVal._checkCreate();

        self.operator = newVal.operator;
        self.stCred = newVal.stCred;
        self.lastStakedAt = newVal.lastStakedAt;
        self.delegation = newVal.delegation;
        self.status = newVal.status;
    }

    function _checkCreate(Info memory newVal) internal pure {
        if (newVal.operator == address(0)) {
            revert ZeroAddress("Operator Address cannot be Zero Address", newVal.operator);
        }
        if (newVal.stCred == address(0)) {
            revert ZeroAddress("Validator Credit Contract cannot be Zero Address", newVal.stCred);
        }
    }

    function _activate(Info storage self) internal {
        if (self.status == Status.Inactive || self.status == Status.Jailed) {
            self.status = Status.Active;
        } else {
            revert ValidatorAlreadyActive();
        }
    }

    function _deactivate(Info storage self, Status newStatus) internal {
        if (self.status == Status.Active && newStatus != Status.Active) {
            self.status = newStatus;
        }
    }

    function _delegate(
        Info storage self,
        DelegationInfo memory newDelegation,
        uint256 stakedAt
    ) internal {
        self._checkDelegate(newDelegation, stakedAt);

        self.lastStakedAt = stakedAt;

        self.delegation.stakes += newDelegation.stakes;
        self.delegation.shares += newDelegation.shares;
    }

    function _checkDelegate(
        Info storage self,
        DelegationInfo memory newDelegation,
        uint256 stakedAt
    ) internal view {
        if (self._isActiveValidator()) {
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
    }

    function _undelegate(Info storage self, DelegationInfo memory newUndelegation) internal {
        self._checkUndelegate(newUndelegation);

        self.delegation.stakes -= newUndelegation.stakes;
        self.delegation.shares -= newUndelegation.shares;
    }

    function _checkUndelegate(
        Info storage self,
        DelegationInfo memory newUndelegation
    ) internal view {
        if (self._isActiveValidator()) {
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
    }

    function _redelegate(
        Info storage self,
        Info storage val,
        DelegationInfo memory dstDelegation,
        DelegationInfo memory srcDelegation
    ) internal {
        self._checkRedelegate(val);

        self._delegate(dstDelegation, block.timestamp);
        val._undelegate(srcDelegation);
    }

    function _checkRedelegate(Info storage self, Info storage val) internal view {
        if (val._isActiveValidator()) {
            revert ValidatorDoesNotExists(val.operator);
        }
        if (self.operator == val.operator) {
            revert SelfRedelegationNotAllowed();
        }
    }

    function _getWeight(
        Info memory self,
        uint256 totalDelegations
    ) internal pure returns (uint256) {
        return (self.delegation.stakes * WEIGTHAGE_RATE_BASE) / totalDelegations;
    }

    function _isActiveValidator(Info memory self) internal pure returns (bool) {
        return self.status == Status.Active;
    }
}
