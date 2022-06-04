// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./Account.sol";
import "./FeeDistribution.sol";

library Config {
    using Account for Account.Data;
    using Config for Data;
    using FeeDistribution for FeeDistribution.Data;

    struct Data {
        Account.Data principalAcc;
        Account.Data rewardAcc;
        FeeDistribution.Data fee;
    }

    function _init(Data storage self, Data calldata obj) internal {
        obj._checkValid();
        self._set(obj);
    }

    function _checkValid(Data calldata self) internal pure {
        self.principalAcc._checkValid();
        self.rewardAcc._checkValid();
        self.fee._checkValid();
    }

    function _set(Data storage self, Data calldata obj) internal {
        self.principalAcc._set(obj.principalAcc);
        self.rewardAcc._set(obj.rewardAcc);
        self.fee._set(obj.fee);
    }
}