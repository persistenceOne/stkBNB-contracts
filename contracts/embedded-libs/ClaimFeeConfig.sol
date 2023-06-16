// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

library ClaimFeeConfig {
    using ClaimFeeConfig for ClaimFeeConfigData;

    error MustBeGreaterThan(uint256 number);
    error MustBeLowerThan(uint256 number);

    struct ClaimFeeConfigData {
        /**
         * @dev A percentage deducted from the balance of the claim payout
         */
        uint256 instantClaimFeePercentage;
        /**
         * @dev Flat fee applied to automated claims
         */
        uint256 automatedClaimFee;
    }

    function _init(ClaimFeeConfigData storage self, ClaimFeeConfigData calldata obj) internal {
        obj._checkValid();
        self._set(obj);
    }

    function _checkValid(ClaimFeeConfigData calldata self) internal pure {
        if (self.instantClaimFeePercentage >= 100) {
            revert MustBeLowerThan(100);
        }
        if (self.automatedClaimFee == 0) {
            revert MustBeGreaterThan(0);
        }
    }

    function _set(ClaimFeeConfigData storage self, ClaimFeeConfigData calldata obj) internal {
        self.automatedClaimFee = obj.automatedClaimFee;
        self.instantClaimFeePercentage = obj.instantClaimFeePercentage;
    }
}
