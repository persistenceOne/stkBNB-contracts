// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

interface ITokenManager {
    function mirrorFee() external view returns (uint256);

    function syncFee() external view returns (uint256);

    function mirror(address bep20Addr, uint64 expireTime) external payable returns (bool);

    function sync(address bep20Addr, uint64 expireTime) external payable returns (bool);
}
