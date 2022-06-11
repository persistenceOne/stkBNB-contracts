// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

interface ITokenHub {
    function getMiniRelayFee() external view returns (uint256);

    function transferOut(
        address contractAddr,
        address recipient,
        uint256 amount,
        uint64 expireTime
    ) external payable returns (bool);
}