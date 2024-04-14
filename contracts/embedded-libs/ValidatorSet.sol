// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

library ValidatorSet {
    error ZeroAddress(string tag, address account);
    error ValidatorInactive(address operator);
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
        // @dev Status of the Validator
        Status status;
        // @dev 5 slots reserved for future use
        uint256[5] __reservedSlots;
        // @dev Validator's Stake Info
        DelegationInfo delegation;
    }

    struct DelegationInfo {
        // @dev Current delegations of the validator (total BNB delegated)
        uint256 stakes;
        // @dev 5 slots reserved for future use
        uint256[5] __reservedSlots;
    }

    enum Status {
        Inactive,
        Active,
        Jailed
    }

    function _create(Info storage self, Info memory newVal) internal {
        newVal._checkCreate();

        self.operator = newVal.operator;
        self.stCred = newVal.stCred;
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

    function _delegate(Info storage self, uint256 newStakes) internal {
        self._checkDelegate(newStakes);

        self.delegation.stakes = newStakes;
    }

    function _checkDelegate(Info storage self, uint256 newStakes) internal view {
        if (!self._isActiveValidator()) {
            revert ValidatorInactive(self.operator);
        }
        if (newStakes < self.delegation.stakes) {
            revert InvalidParam("newStakes < self.delegation.stakes", newStakes);
        }
    }

    function _undelegate(Info storage self, uint256 newUnstakes) internal {
        self._checkUndelegate(newUnstakes);

        self.delegation.stakes -= newUnstakes;
    }

    function _checkUndelegate(Info storage self, uint256 newUnstakes) internal view {
        if (!self._isActiveValidator()) {
            revert ValidatorInactive(self.operator);
        }
        if (newUnstakes == 0) {
            revert InvalidParam("newUnstakes == 0", newUnstakes);
        }
        if (newUnstakes > self.delegation.stakes) {
            revert InvalidParam("newUnstakes > self.delegation.stakes", newUnstakes);
        }
    }

    function _redelegate(
        Info storage self,
        Info storage val,
        uint256 dstStakes,
        uint256 srcRestakes
    ) internal {
        self._checkRedelegate(val);

        self._delegate(dstStakes);
        val._undelegate(srcRestakes);
    }

    function _checkRedelegate(Info storage self, Info storage val) internal view {
        if (!val._isActiveValidator()) {
            revert ValidatorInactive(val.operator);
        }
        if (self.operator == val.operator) {
            revert SelfRedelegationNotAllowed();
        }
    }

    function _isActiveValidator(Info memory self) internal pure returns (bool) {
        return self.status == Status.Active;
    }

    function _exists(Info memory self) internal pure returns (bool) {
        return self.operator != address(0);
    }
}
