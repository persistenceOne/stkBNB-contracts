// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

library ConfigV2 {
    using ConfigV2 for DataV2;

    error MustBeGreaterThan(uint256 number);
    error MustBeLowerThan(uint256 number);

    struct DataV2 {
        /**
         * @dev A percentage deducted from the balance of the claim payout
         */
        uint256 instantClaimFeePercentage;
        /**
         * @dev Flat fee applied to automated claims
         */
        uint256 automatedClaimFee;
    }

    function _init(DataV2 storage self, DataV2 calldata obj) internal {
        obj._checkValid();
        self._set(obj);
    }

    function _checkValid(DataV2 calldata self) internal pure {
        if (self.instantClaimFeePercentage > 100) {
            revert MustBeLowerThan(100);
        }
        if (self.automatedClaimFee == 0) {
            revert MustBeGreaterThan(0);
        }
    }

    function _set(DataV2 storage self, DataV2 calldata obj) internal {
        self.automatedClaimFee = obj.automatedClaimFee;
        self.instantClaimFeePercentage = obj.instantClaimFeePercentage;
    }
}
