// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

// BasisFee uses a constant denominator of 100000000000
library BasisFee {
    error NumeratorMoreThanBasis();

    uint256 internal constant _BASIS = 100000000000;

    function _checkValid(uint256 self) internal pure {
        if (self > _BASIS) {
            revert NumeratorMoreThanBasis();
        }
    }

    function _apply(uint256 self, uint256 amount) internal pure returns (uint256) {
        return (amount * self) / _BASIS;
    }
}

